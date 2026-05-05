from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import os
from datetime import datetime
from ..database import get_db
from ..services.security import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

class LoginRequest(BaseModel):
    username: str
    password: str

class ProfileUpdateRequest(BaseModel):
    username: str
    alert_email: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    alert_email: str

# Dependency to get current user from token (Moved up to avoid NameError)
async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    from ..services.security import decode_access_token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.post("/login")
async def login(credentials: LoginRequest, db=Depends(get_db)):
    # Normalize username to lowercase
    username_norm = credentials.username.lower()
    user = await db.users.find_one({"username": username_norm})
    
    # First-Run Auto-Provision: If NO users exist in the DB, allow admin/admin once
    if not user:
        user_count = await db.users.count_documents({})
        if user_count == 0:
            if username_norm == "admin" and credentials.password == "admin":
                hashed_pw = get_password_hash("admin")
                await db.users.insert_one({"username": "admin", "password": hashed_pw, "role": "admin", "created_at": datetime.utcnow().isoformat()})
                access_token = create_access_token(data={"sub": "admin"})
                return {"status": "success", "username": "admin", "access_token": access_token, "token_type": "bearer"}
        
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    # Check if account is locked (Lockout after 5 failed attempts)
    if user.get("failed_login_attempts", 0) >= 5:
        # Audit Log: Brute-Force Attempt detected
        await db.audit_logs.insert_one({
            "action": "LOCKOUT_TRIGGERED",
            "actor": username_norm,
            "details": "Account locked due to excessive failed attempts.",
            "timestamp": datetime.utcnow()
        })
        raise HTTPException(status_code=403, detail="ACCOUNT_LOCKED: Too many failed attempts. Contact Senior SOC Admin.")

    try:
        if not verify_password(credentials.password, user.get("password")):
            # Increment failed attempts
            await db.users.update_one(
                {"username": username_norm},
                {"$inc": {"failed_login_attempts": 1}}
            )
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        # Success: Reset failed attempts
        await db.users.update_one(
            {"username": username_norm},
            {"$set": {"failed_login_attempts": 0, "last_login": datetime.utcnow().isoformat()}}
        )
        
    except Exception as e:
        # This handles 'UnknownHashError' if the DB contains plain text or bad hashes
        print(f"AUTH_ERROR: Password verification failed for {username_norm}: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials or malformed account. Please re-register.")
        
    access_token = create_access_token(data={"sub": username_norm})
    return {
        "status": "success", 
        "username": username_norm, 
        "role": user.get("role", "analyst"),
        "access_token": access_token, 
        "token_type": "bearer"
    }

@router.post("/register")
async def register(credentials: RegisterRequest, db=Depends(get_db), current_user: dict = Depends(get_current_user)):
    """
    SECURED REGISTRATION: 
    Only an existing logged-in Admin/Analyst can register a new Operator.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Clearance Denied: Only SOC Administrators can commission new operators.")

    # Normalize username
    username_norm = credentials.username.lower()

    # Check if user already exists
    existing_user = await db.users.find_one({"username": username_norm})
    if existing_user:
        raise HTTPException(status_code=400, detail="Operator ID already registered.")
        
    new_user = {
        "username": username_norm,
        "password": get_password_hash(credentials.password),
        "alert_email": credentials.alert_email,
        "role": "analyst",
        "created_by": current_user.get("username"),
        "created_at": datetime.utcnow().isoformat()
    }
    await db.users.insert_one(new_user)
    
    # Audit Log
    await db.audit_logs.insert_one({
        "action": "USER_REGISTERED",
        "actor": current_user.get("username"),
        "target": username_norm,
        "timestamp": datetime.utcnow()
    })
    
    return {"status": "success", "username": username_norm}

@router.get("/users")
async def list_users(db=Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    cursor = db.users.find({}, {"password": 0})
    users = await cursor.to_list(length=100)
    for user in users:
        user["_id"] = str(user["_id"])
    return users

@router.delete("/users/{username}")
async def delete_user(username: str, db=Depends(get_db), current_user: dict = Depends(get_current_user)):
    # DIAGNOSTIC: Check role and identity
    print(f"SECURITY_TRACE: User '{current_user.get('username')}' with role '{current_user.get('role')}' is attempting to decommission '{username}'")
    
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Admin clearance required for decommissioning.")
        
    if username == current_user.get("username"):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    result = await db.users.delete_one({"username": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Audit Log
    await db.audit_logs.insert_one({
        "action": "USER_DELETED",
        "actor": current_user.get("username"),
        "target": username,
        "timestamp": datetime.utcnow()
    })
    
    return {"status": "success"}

@router.get("/profile/{username}")
async def get_profile(username: str, db=Depends(get_db)):
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "username": user.get("username"),
        "role": user.get("role", "analyst"),
        "alert_email": user.get("alert_email", "")
    }

@router.put("/profile")
async def update_profile(profile: ProfileUpdateRequest, db=Depends(get_db)):
    result = await db.users.update_one(
        {"username": profile.username},
        {"$set": {"alert_email": profile.alert_email}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success"}

@router.get("/audit-logs")
async def get_audit_logs(db=Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Audit Vault access restricted to SOC Admins.")
        
    cursor = db.audit_logs.find().sort("timestamp", -1)
    logs = await cursor.to_list(length=200)
    for log in logs:
        log["_id"] = str(log["_id"])
    return logs

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["Auth"])

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

@router.post("/login")
async def login(credentials: LoginRequest, db=Depends(get_db)):
    user = await db.users.find_one({"username": credentials.username})
    
    # Auto-provision admin/admin for the lab environment if it doesn't exist yet
    if not user:
        if credentials.username == "admin" and credentials.password == "admin":
            await db.users.insert_one({"username": "admin", "password": "admin"})
            return {"status": "success", "username": "admin"}
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if user.get("password") != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return {"status": "success", "username": credentials.username}

@router.post("/register")
async def register(credentials: RegisterRequest, db=Depends(get_db)):
    # Check if user already exists
    existing_user = await db.users.find_one({"username": credentials.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
        
    new_user = {
        "username": credentials.username,
        "password": credentials.password,
        "alert_email": credentials.alert_email
    }
    await db.users.insert_one(new_user)
    
    return {"status": "success", "username": credentials.username}

@router.get("/profile/{username}")
async def get_profile(username: str, db=Depends(get_db)):
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "username": user.get("username"),
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

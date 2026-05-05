import motor.motor_asyncio
import asyncio
import os
import sys
from datetime import datetime

# Adding parent directory to path to import our security services
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
from services.security import get_password_hash

async def seed_user():
    print("SECURE_SEED: Initializing Administrative Identity...")
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.cyberdetect
    
    # Secure Admin Configuration
    admin_username = "admin"
    admin_password = "admin_change_me_123" # In production, this would be an env var
    
    user = {
        "username": admin_username,
        "password": get_password_hash(admin_password),
        "email": "admin@soc.nexus",
        "alert_email": "admin@soc.nexus",
        "role": "admin",
        "is_active": True,
        "failed_login_attempts": 0,
        "last_login": None,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.users.update_one(
        {"username": admin_username},
        {"$set": user},
        upsert=True
    )
    
    # Seed a test audit log entry
    await db.audit_logs.insert_one({
        "action": "SYSTEM_INITIALIZED",
        "actor": "ROOT_SYSTEM",
        "details": "Administrative identity seeded via secure script.",
        "timestamp": datetime.utcnow()
    })
    
    print(f"SUCCESS: Operator '{admin_username}' initialized with SECURE_HASH.")
    print(f"CRITICAL: Password set to '{admin_password}'. CHANGE IMMEDIATELY AFTER LOGIN.")

if __name__ == "__main__":
    asyncio.run(seed_user())

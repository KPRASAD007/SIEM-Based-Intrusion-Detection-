import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# --- SECURITY AUDIT: Use Env Vars for Database Credentials ---
# Default to localhost for lab, but allow override via MONGO_URL env var
# Example: mongodb://user:password@hostname:27017/
MONGO_URL = os.getenv("MONGO_URL", "mongodb://127.0.0.1:27017/?serverSelectionTimeoutMS=2000")
DB_NAME = os.getenv("DB_NAME", "cyberdetect")

class DataBase:
    client: AsyncIOMotorClient = None
    db = None

db_instance = DataBase()

async def connect_to_mongo():
    try:
        # Check if URL contains credentials for logging safety (don't print password)
        safe_url = MONGO_URL
        if "@" in MONGO_URL:
            safe_url = "mongodb://****:****@" + MONGO_URL.split("@")[1]
            
        db_instance.client = AsyncIOMotorClient(MONGO_URL)
        db_instance.db = db_instance.client[DB_NAME]
        
        # Verify connection
        await db_instance.client.admin.command('ping')
        print(f"SYSTEM: Secured MongoDB Link Established -> {safe_url}")
    except Exception as e:
        logging.error(f"DATABASE_CRITICAL: Failed to connect to MongoDB: {e}")
        print(f"CRITICAL: MongoDB Connection Failure. System functionality will be limited.")

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        print("SYSTEM: MongoDB Connection Terminated.")

async def get_db():
    # Auto-connect for serverless environments where startup events don't fire
    if db_instance.db is None:
        await connect_to_mongo()
    return db_instance.db

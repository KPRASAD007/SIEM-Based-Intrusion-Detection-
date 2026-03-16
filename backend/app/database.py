import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "cyberdetect")

class DataBase:
    client: AsyncIOMotorClient = None
    db = None

db_instance = DataBase()

async def connect_to_mongo():
    try:
        db_instance.client = AsyncIOMotorClient(MONGO_URL)
        db_instance.db = db_instance.client[DB_NAME]
        print(f"Connected to MongoDB at {MONGO_URL}")
    except Exception as e:
        print(f"Could not connect to MongoDB: {e}")

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        print("MongoDB connection closed")

def get_db():
    return db_instance.db

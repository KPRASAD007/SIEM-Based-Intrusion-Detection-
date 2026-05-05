import motor.motor_asyncio
import asyncio

async def clear_users():
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.cyberdetect
    
    # Delete all users
    result = await db.users.delete_many({})
    print(f"Deleted {result.deleted_count} users from the database.")
    
    # Optionally, you can also clear the alerts, logs, etc. if you want a fresh start
    # await db.alerts.delete_many({})
    # await db.logs.delete_many({})
    # print("Cleared alerts and logs.")

if __name__ == "__main__":
    asyncio.run(clear_users())

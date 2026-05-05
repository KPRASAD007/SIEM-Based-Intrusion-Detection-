import motor.motor_asyncio
import asyncio

async def verify():
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.cyberdetect
    count = await db.users.count_documents({})
    print(f"Remaining users in database: {count}")

if __name__ == "__main__":
    asyncio.run(verify())

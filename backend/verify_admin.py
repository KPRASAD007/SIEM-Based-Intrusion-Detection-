import motor.motor_asyncio
import asyncio

async def verify_admin():
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.cyberdetect
    user = await db.users.find_one({"username": "admin"})
    if user:
        print(f"VERIFICATION: User 'admin' found with role '{user.get('role')}'")
    else:
        print("VERIFICATION: User 'admin' not found!")

if __name__ == "__main__":
    asyncio.run(verify_admin())

import motor.motor_asyncio
import asyncio

async def seed_user():
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.cyberdetect
    
    # Ensure a user exists with an alert_email
    user = {
        "username": "admin",
        "email": "krishnaprasadt004@gmail.com",
        "alert_email": "krishnaprasadt004@gmail.com",
        "full_name": "SOC Administrator",
        "role": "admin"
    }
    
    await db.users.update_one(
        {"username": "admin"},
        {"$set": user},
        upsert=True
    )
    print("User seeded/updated with alert_email")

if __name__ == "__main__":
    asyncio.run(seed_user())

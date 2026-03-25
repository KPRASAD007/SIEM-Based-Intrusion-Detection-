import asyncio
import motor.motor_asyncio

async def check():
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.cyberdetect
    rules = await db.rules.find().to_list(100)
    for r in rules:
        print(f"Rule: {r.get('name')} | Field: {r.get('field')} | Op: {r.get('operator')} | Value: {r.get('value')} | Active: {r.get('is_active')}")

if __name__ == "__main__":
    asyncio.run(check())

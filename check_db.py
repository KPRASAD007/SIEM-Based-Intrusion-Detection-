import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://127.0.0.1:27017')
    db = client['cyberdetect']
    rules = await db.rules.find().to_list(100)
    print(f"DEBUG: Found {len(rules)} rules.")
    for r in rules:
        print(f"Rule: {r.get('name')} | Active: {r.get('is_active')} | Value: {r.get('value')}")
    
    # Also check alerts
    alerts = await db.alerts.find().sort("triggered_time", -1).limit(5).to_list(10)
    print(f"DEBUG: Found {len(alerts)} alerts.")
    for a in alerts:
        print(f"Alert: {a.get('rule_name')} | Time: {a.get('triggered_time')}")

if __name__ == "__main__":
    asyncio.run(check())

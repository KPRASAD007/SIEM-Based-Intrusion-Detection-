import asyncio
import os
import sys

# Add the project root to sys.path to allow relative imports
sys.path.append(os.path.join(os.environ["USERPROFILE"], "Documents", "project"))

from backend.app.database import connect_to_mongo, get_db

async def check():
    await connect_to_mongo()
    db = get_db()
    
    rules = await db.rules.find({"is_active": True}).to_list(100)
    print(f"DEBUG: Found {len(rules)} active rules.")
    for r in rules:
        print(f"  Rule: {r.get('name')} | Field: {r.get('field')} | Value: {r.get('value')}")
    
    alerts = await db.alerts.find().to_list(10)
    print(f"DEBUG: Found {len(alerts)} alerts.")
    for a in alerts:
        print(f"  Alert: {a.get('rule_name')} | Severity: {a.get('severity')}")

if __name__ == "__main__":
    asyncio.run(check())

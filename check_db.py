import asyncio
import os
import sys

# Add the root directory to sys.path to allow absolute imports like `from backend.app...`
sys.path.append(os.getcwd())

from backend.app.database import connect_to_mongo, get_db

async def check_db():
    await connect_to_mongo()
    db = get_db()
    if db is None:
        print("DB is None")
        return
    
    rules_count = await db.rules.count_documents({})
    logs_count = await db.logs.count_documents({})
    alerts_count = await db.alerts.count_documents({})
    
    print(f"Rules: {rules_count}")
    print(f"Logs: {logs_count}")
    print(f"Alerts: {alerts_count}")

if __name__ == "__main__":
    asyncio.run(check_db())

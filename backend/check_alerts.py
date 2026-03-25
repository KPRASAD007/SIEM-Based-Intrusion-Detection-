import motor.motor_asyncio
import asyncio

async def check_alerts():
    client = motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.cyberdetect
    alerts = await db.alerts.find().to_list(100)
    print(f"Total Alerts in DB: {len(alerts)}")
    for a in alerts:
        print(f"Alert: {a.get('rule_name')} | Severity: {a.get('severity')} | Host: {a.get('affected_host')}")

if __name__ == "__main__":
    asyncio.run(check_alerts())

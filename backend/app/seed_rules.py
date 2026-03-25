import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def inject_rules():
    client = AsyncIOMotorClient('mongodb://127.0.0.1:27017')
    db = client['cyberdetect']
    
    # Check if a critical rule already exists
    exists = await db.rules.find_one({"severity": "critical"})
    if not exists:
        await db.rules.insert_many([
            {
                "name": "Ransomware: Backup Destruction",
                "description": "Adversary attempting to delete system Volume Shadow Copies to prevent recovery.",
                "field": "process_name",
                "operator": "equals",
                "value": "vssadmin.exe",
                "severity": "critical",
                "mitre_attack_id": "T1490",
                "is_active": True
            },
            {
                "name": "Malicious Download Cradle",
                "description": "PowerShell used to execute remote payloads directly in-memory.",
                "field": "process_name",
                "operator": "equals",
                "value": "powershell.exe",
                "severity": "critical",
                "mitre_attack_id": "T1059.001",
                "is_active": True
            }
        ])
        print("Successfully injected CRITICAL rules into Detection Engine.")
    else:
        print("Rules already exist.")

if __name__ == "__main__":
    asyncio.run(inject_rules())

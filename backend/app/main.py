from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import connect_to_mongo, close_mongo_connection
from .routers import logs, rules, alerts, incidents, simulator, search, auth, threat_intel, soar

app = FastAPI(
    title="CyberDetect Lab API",
    description="Backend for the Security Operations Center (SOC) Dashboard",
    version="1.0.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/api/download", StaticFiles(directory="app/static"), name="static")

app.include_router(logs.router)
app.include_router(rules.router)
app.include_router(alerts.router)
app.include_router(incidents.router)
app.include_router(threat_intel.router)
app.include_router(soar.router)
app.include_router(simulator.router)
app.include_router(search.router)
app.include_router(auth.router)

from .database import connect_to_mongo, close_mongo_connection, get_db

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    
    # Auto-seed Rules for the Detection Engine
    db = get_db()
    
    # Force clean rules for debugging/consistency
    print("SYSTEM: refreshing detection rules...")
    await db.rules.delete_many({})
    
    # Seeding critical rules
    await db.rules.insert_many([
        {
            "name": "Ransomware: Shadow Copy Deletion",
            "description": "Detection of vssadmin.exe attempting to delete backups.",
            "field": "process_name",
            "operator": "equals",
            "value": "vssadmin.exe",
            "severity": "critical",
            "mitre_attack_id": "T1490",
            "is_active": True
        },
        {
            "name": "Malicious PowerShell Execution",
            "description": "Encoded command line detected in PowerShell process.",
            "field": "process_name",
            "operator": "equals",
            "value": "powershell.exe",
            "severity": "critical",
            "mitre_attack_id": "T1059.001",
            "is_active": True
        },
        {
            "name": "Credential Dumping: LSASS",
            "description": "Detection of LSASS process access commonly used for credential harvesting.",
            "field": "process_name",
            "operator": "equals",
            "value": "lsass.exe",
            "severity": "critical",
            "mitre_attack_id": "T1003",
            "is_active": True
        },
        {
            "name": "Suspicious Network Connection: C2",
            "description": "Outbound connection to known C2 infrastructure detected.",
            "field": "ip_address",
            "operator": "contains",
            "value": "45.33.22.11",
            "severity": "critical",
            "mitre_attack_id": "T1105",
            "is_active": True
        },
        {
            "name": "Persistence: Scheduled Task Creation",
            "description": "schtasks.exe used to create a recurring task for persistence.",
            "field": "process_name",
            "operator": "equals",
            "value": "schtasks.exe",
            "severity": "high",
            "mitre_attack_id": "T1053.005",
            "is_active": True
        },
        {
            "name": "Defense Evasion: Event Log Clearing",
            "description": "wevtutil.exe used to clear security event logs.",
            "field": "process_name",
            "operator": "equals",
            "value": "wevtutil.exe",
            "severity": "critical",
            "mitre_attack_id": "T1070.001",
            "is_active": True
        }
    ])
    print("SYSTEM: Clean Seed of Detection Rules Complete.")

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "CyberDetect Lab API is running"}

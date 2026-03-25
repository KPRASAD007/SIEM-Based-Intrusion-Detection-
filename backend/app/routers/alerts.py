from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId

from ..database import get_db

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

# Mock Threat Intel Enrichment Function
def enrich_alert_with_threat_intel(alert_dict):
    ip = alert_dict.get("source_ip")
    if ip and not alert_dict.get("threat_intel"):
        # Mocking AbuseIPDB, OTX, VirusTotal response
        alert_dict["threat_intel"] = {
            "score": 85 if ip.startswith("192") else 10,
            "status": "MALICIOUS" if ip.startswith("192") else "CLEAN",
            "country": "Mock Country",
            "known_malicious_activity": True if ip == "192.168.1.100" else False,
            "sources": ["AbuseIPDB (Mock)", "VirusTotal (Mock)"]
        }
    return alert_dict

@router.get("")
async def get_alerts(status: str = None, db=Depends(get_db)):
    query = {}
    if status:
        query["status"] = status
        
    cursor = db.alerts.find(query).sort("triggered_time", -1)
    alerts = await cursor.to_list(length=100)
    for alert in alerts:
        alert["id"] = str(alert["_id"])
        alert["_id"] = str(alert["_id"])
        # Apply mock TI enrichment on read
        alert = enrich_alert_with_threat_intel(alert)
        
    return alerts

@router.put("/{id}/status")
async def update_alert_status(id: str, status: str, db=Depends(get_db)):
    result = await db.alerts.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found or status already set")
    return {"status": "success", "new_status": status}

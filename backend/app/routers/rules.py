from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId

from ..database import get_db
from ..models.schemas import RuleModel

router = APIRouter(prefix="/api/rules", tags=["Rules"])

@router.post("", response_model=RuleModel)
async def create_rule(rule: RuleModel, db=Depends(get_db)):
    rule_dict = rule.model_dump(by_alias=True, exclude_none=True)
    result = await db.rules.insert_one(rule_dict)
    rule_dict["_id"] = str(result.inserted_id)
    return rule_dict

@router.get("")
async def get_rules(db=Depends(get_db)):
    cursor = db.rules.find().sort("name", 1)
    rules = await cursor.to_list(length=100)
    for rule in rules:
        rule["id"] = str(rule["_id"])
        rule["_id"] = str(rule["_id"])
    return rules

@router.delete("/{id}")
async def delete_rule(id: str, db=Depends(get_db)):
    result = await db.rules.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"status": "success"}

@router.put("/{id}/toggle")
async def toggle_rule(id: str, db=Depends(get_db)):
    rule = await db.rules.find_one({"_id": ObjectId(id)})
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    new_status = not rule.get("is_active", True)
    await db.rules.update_one({"_id": ObjectId(id)}, {"$set": {"is_active": new_status}})
    
    rule["is_active"] = new_status
    rule["id"] = str(rule["_id"])
    rule["_id"] = str(rule["_id"])
    return rule

@router.post("/seed")
async def seed_rules(db=Depends(get_db)):
    await db.rules.delete_many({})
    seeds = [
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
            "name": "Credential Dumping Tool Detected",
            "description": "Mimikatz or similar password dumper launched.",
            "field": "process_name",
            "operator": "contains",
            "value": "mimikatz",
            "severity": "critical",
            "mitre_attack_id": "T1003",
            "is_active": True
        },
        {
            "name": "Network Scanning Utility Detected",
            "description": "Nmap or similar port scanner launched on host.",
            "field": "process_name",
            "operator": "contains",
            "value": "nmap",
            "severity": "high",
            "mitre_attack_id": "T1046",
            "is_active": True
        },
        {
            "name": "Lateral Movement Tool Detected",
            "description": "PsExec execution spotted, potentially indicating lateral movement.",
            "field": "process_name",
            "operator": "contains",
            "value": "psexec",
            "severity": "high",
            "mitre_attack_id": "T1134",
            "is_active": True
        },
        {
            "name": "Suspicious Download via Certutil",
            "description": "certutil.exe launched flagrantly.",
            "field": "process_name",
            "operator": "contains",
            "value": "certutil",
            "severity": "high",
            "mitre_attack_id": "T1105",
            "is_active": True
        },
        {
            "name": "IDS: Network Port Scanning Detected",
            "description": "Suricata alert for suspicious inbound scanning (ET SCAN).",
            "field": "event_type",
            "operator": "equals",
            "value": "suricata",
            "severity": "high",
            "mitre_attack_id": "T1046",
            "is_active": True
        },
        {
            "name": "DPI: SSH Protocol Anomaly",
            "description": "Deep Packet Inspection alert for invalid SSH handshake banner.",
            "field": "signature",
            "operator": "contains",
            "value": "SSH invalid banner",
            "severity": "critical",
            "mitre_attack_id": "T1110",
            "is_active": True
        },
        {
            "name": "SIEM: SSH Brute Force (Host Layer)",
            "description": "Wazuh/Wazuh-style detection of multiple failed SSH logins.",
            "field": "event_type",
            "operator": "equals",
            "value": "ssh_auth_failure",
            "severity": "medium",
            "mitre_attack_id": "T1110.001",
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
        }
    ]
    await db.rules.insert_many(seeds)
    return {"status": "success", "count": len(seeds)}


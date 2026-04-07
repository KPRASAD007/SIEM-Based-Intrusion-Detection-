from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional
from ..database import get_db
from datetime import datetime
from ..websocket_manager import manager
import os

router = APIRouter(prefix="/api/deception", tags=["deception"])

class HoneyAsset(BaseModel):
    name: str
    type: str  # server, database, workstation
    ip: str
    status: str  # active, breached, offline
    last_interaction: Optional[str] = None

class HoneyToken(BaseModel):
    name: str
    value: str
    type: str  # credential, file, api_key
    risk_score: int

class HoneyTrigger(BaseModel):
    asset_name: str
    attacker_ip: str
    attacker_host: Optional[str] = "UNKNOWN"
    trigger_type: str
    details: Optional[str] = ""

class HoneypotLogin(BaseModel):
    username: str
    password: str
    domain:   Optional[str] = "CORP"
    user_agent: Optional[str] = ""
    screen_res: Optional[str] = ""
    language:   Optional[str] = ""

@router.get("/honeypot", response_class=HTMLResponse, include_in_schema=False)
async def serve_honeypot_page(request: Request):
    """Serves the fake corporate login page to lure threat actors."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "static", "honeypot.html")
    with open(html_path, "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@router.get("/assets", response_model=List[HoneyAsset])
async def get_honey_assets(db=Depends(get_db)):
    cursor = db.honey_assets.find({})
    assets = await cursor.to_list(length=100)
    for a in assets:
        a["id"] = str(a["_id"]); a["_id"] = str(a["_id"])
    return assets

@router.get("/tokens", response_model=List[HoneyToken])
async def get_honey_tokens(db=Depends(get_db)):
    cursor = db.honey_tokens.find({})
    tokens = await cursor.to_list(length=100)
    for t in tokens:
        t["id"] = str(t["_id"]); t["_id"] = str(t["_id"])
    return tokens

@router.post("/assets")
async def create_honey_asset(asset: HoneyAsset, db=Depends(get_db)):
    asset_dict = asset.dict()
    await db.honey_assets.insert_one(asset_dict)
    return {"message": "HoneyAsset created successfully"}

@router.post("/tokens")
async def create_honey_token(token: HoneyToken, db=Depends(get_db)):
    token_dict = token.dict()
    await db.honey_tokens.insert_one(token_dict)
    return {"message": "HoneyToken created successfully"}

@router.post("/honeypot-login")
async def capture_honeypot_login(login: HoneypotLogin, request: Request, db=Depends(get_db)):
    """
    Fires when a threat actor submits credentials on the honeypot login page.
    Captures username/password, attacker IP, browser fingerprint.
    Generates a CRITICAL alert and auto-escalates to a case.
    """
    now = datetime.utcnow()

    # Get real attacker IP from request
    attacker_ip = (
        request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        or request.headers.get("X-Real-IP", "")
        or str(request.client.host)
    )

    # Build CRITICAL alert with captured credentials
    alert_dict = {
        "rule_id": "honeypot-login-capture",
        "rule_name": f"🍯 HONEYPOT LOGIN: Credentials Captured from {attacker_ip}",
        "severity": "critical",
        "mitre_attack_id": "T1078.001",  # Valid Accounts: Default Accounts
        "affected_host": "HONEYPOT-LOGIN-PORTAL",
        "source_ip": attacker_ip,
        "triggered_time": now,
        "matching_logs": 1,
        "log_ids": [],
        "status": "new",
        "detection_layer": "DECEPTION/CREDENTIAL-TRAP",
        "threat_intel": {
            "score": 99,
            "status": "credential_harvesting_attempt",
            "captured_username": login.username,
            "captured_password": login.password,
            "captured_domain": login.domain,
            "attacker_browser": login.user_agent[:120] if login.user_agent else "Unknown",
            "screen_resolution": login.screen_res,
            "language": login.language
        }
    }
    alert_result = await db.alerts.insert_one(alert_dict)
    alert_dict["_id"] = str(alert_result.inserted_id)
    alert_dict["id"] = alert_dict["_id"]
    alert_dict["triggered_time"] = now.isoformat()

    # Auto-escalate to incident case
    count = await db.incidents.count_documents({})
    incident = {
        "case_id": f"CAS-{count + 1:04d}",
        "title": f"Credential Harvest Attempt from {attacker_ip} — Username: {login.username}",
        "severity": "critical",
        "status": "open",
        "analyst_assigned": "Unassigned",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "related_alerts": [alert_dict["_id"]],
        "notes": [{
            "timestamp": now.isoformat(),
            "author": "Deception Grid — Honeypot Login Trap",
            "content": (
                f"Threat actor at {attacker_ip} submitted credentials on the honeypot login portal.\n"
                f"Username: {login.username}\n"
                f"Password: {login.password}\n"
                f"Domain: {login.domain}\n"
                f"Browser: {login.user_agent[:200] if login.user_agent else 'Unknown'}\n"
                f"Screen: {login.screen_res} | Language: {login.language}"
            )
        }]
    }
    await db.incidents.insert_one(incident)

    # Store captured credential in honeypot tokens collection for evidence
    await db.honey_tokens.insert_one({
        "name": f"Captured Credential — {login.username}",
        "value": f"{login.domain}\\{login.username}:{login.password}",
        "type": "captured_credential",
        "risk_score": 99,
        "attacker_ip": attacker_ip,
        "captured_at": now.isoformat()
    })

    # Broadcast to all connected dashboards immediately
    await manager.broadcast({"type": "NEW_ALERT", "data": alert_dict})
    await manager.broadcast({"type": "HONEYPOT_BREACH", "data": {
        "asset": "HONEYPOT-LOGIN-PORTAL",
        "attacker_ip": attacker_ip,
        "trigger_type": "credential_submission",
        "username": login.username,
        "timestamp": now.isoformat()
    }})

    print(f"🍯 CREDENTIAL CAPTURED: {login.domain}\\{login.username}:{login.password} from {attacker_ip}")
    return {"status": "ok"}  # Neutral response — don't reveal it's a honeypot

@router.post("/trigger")
async def honeypot_triggered(trigger: HoneyTrigger, db=Depends(get_db)):
    """
    Call this when a honeypot asset is accessed by a threat actor.
    Creates a CRITICAL alert and auto-escalates to an incident case.
    Works completely independently of the log-forwarding pipeline.
    """
    now = datetime.utcnow()

    # 1. Update honeypot asset status to 'breached'
    await db.honey_assets.update_one(
        {"name": trigger.asset_name},
        {"$set": {"status": "breached", "last_interaction": now.isoformat()}}
    )

    # 2. Create a CRITICAL alert
    alert_dict = {
        "rule_id": "honeypot-breach",
        "rule_name": f"🍯 HONEYPOT BREACHED: {trigger.asset_name}",
        "severity": "critical",
        "mitre_attack_id": "T1078",  # Valid Accounts (common honeypot lure technique)
        "affected_host": trigger.asset_name,
        "source_ip": trigger.attacker_ip,
        "triggered_time": now,
        "matching_logs": 1,
        "log_ids": [],
        "status": "new",
        "detection_layer": "DECEPTION/HONEYPOT",
        "threat_intel": {
            "score": 95,
            "status": "honeypot_interaction",
            "attacker_host": trigger.attacker_host,
            "trigger_type": trigger.trigger_type,
            "details": trigger.details
        }
    }
    alert_result = await db.alerts.insert_one(alert_dict)
    alert_dict["_id"] = str(alert_result.inserted_id)
    alert_dict["id"] = alert_dict["_id"]
    alert_dict["triggered_time"] = now.isoformat()

    # 3. Auto-escalate to an incident case
    count = await db.incidents.count_documents({})
    incident = {
        "case_id": f"CAS-{count + 1:04d}",
        "title": f"Honeypot Breach: {trigger.trigger_type} on {trigger.asset_name} from {trigger.attacker_ip}",
        "severity": "critical",
        "status": "open",
        "analyst_assigned": "Unassigned",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "related_alerts": [alert_dict["_id"]],
        "notes": [{
            "timestamp": now.isoformat(),
            "author": "Deception Grid",
            "content": f"Threat actor {trigger.attacker_ip} ({trigger.attacker_host}) triggered honeypot '{trigger.asset_name}' via {trigger.trigger_type}. Details: {trigger.details}"
        }]
    }
    await db.incidents.insert_one(incident)

    # 4. Broadcast CRITICAL alert to all connected dashboards via WebSocket
    await manager.broadcast({"type": "NEW_ALERT", "data": alert_dict})
    await manager.broadcast({"type": "HONEYPOT_BREACH", "data": {
        "asset": trigger.asset_name,
        "attacker_ip": trigger.attacker_ip,
        "trigger_type": trigger.trigger_type,
        "timestamp": now.isoformat()
    }})

    print(f"🍯 HONEYPOT BREACH: {trigger.asset_name} accessed by {trigger.attacker_ip} via {trigger.trigger_type}")
    return {
        "status": "breach_logged",
        "alert_id": alert_dict["_id"],
        "case_id": incident["case_id"],
        "message": f"CRITICAL: {trigger.asset_name} breached by {trigger.attacker_ip}"
    }


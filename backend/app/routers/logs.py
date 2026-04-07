from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
from datetime import datetime
import json

from ..database import get_db
from ..models.schemas import LogModel, AlertModel
from ..services.detection_engine import detection_engine
from ..services.email_service import send_alert_email
from ..websocket_manager import manager

router = APIRouter(prefix="/api/logs", tags=["Logs"])

async def process_log_for_alerts(log_dict: Dict[str, Any], db, background_tasks: BackgroundTasks = None):
    # Fetch active rules
    rules_cursor = db.rules.find({"is_active": True})
    active_rules = await rules_cursor.to_list(length=100)
    
    import traceback
    try:
        # Evaluate
        matched_rules = await detection_engine.evaluate_log(log_dict, active_rules)
        
        for rule in matched_rules:
            # Identify Detection Layer
            event_type = log_dict.get("event_type", "").lower()
            layer = "HOST"
            if "suricata" in event_type:
                layer = "NETWORK/IDS"
            if "DPI" in (rule.get("name") or ""):
                layer = "NETWORK/DPI"
            elif "auth_failure" in event_type or "security" in event_type:
                layer = "HOST/SIEM"
            elif "sysmon" in event_type:
                layer = "HOST/SYSMON"

            # Create an alert
            alert = AlertModel(
                rule_id=str(rule.get("_id")),
                rule_name=rule.get("name"),
                severity=rule.get("severity"),
                mitre_attack_id=rule.get("mitre_attack_id"),
                affected_host=log_dict.get("details", {}).get("host") or log_dict.get("ip_address"),
                source_ip=log_dict.get("ip_address"),
                triggered_time=datetime.utcnow(),
                matching_logs=1,
                log_ids=[str(log_dict.get("_id"))],
                status="new",
                detection_layer=layer
            )
            
            # Enrichment (mocked here, can be extended in thread_intel service)
            if alert.source_ip:
                alert.threat_intel = {"score": 0, "status": "clean (mock)"}
                
            alert_dict = alert.model_dump(by_alias=True, exclude_none=True)
            if not isinstance(alert_dict.get("triggered_time"), datetime):
                alert_dict["triggered_time"] = datetime.utcnow()
            result = await db.alerts.insert_one(alert_dict)
            alert_dict["_id"] = str(result.inserted_id)
            alert_dict["id"] = alert_dict["_id"]
            
            # Broadcast alert
            await manager.broadcast({
                "type": "NEW_ALERT",
                "data": alert_dict
            })
            
            # Trigger Email Notification for High/Critical alerts in Background
            if alert_dict.get("severity", "").lower() in ["high", "critical"]:
                if background_tasks:
                    background_tasks.add_task(send_alert_email, alert, db)
                else:
                    # Fallback for manual calls where BackgroundTasks may be missing
                    import asyncio
                    asyncio.create_task(send_alert_email(alert, db))
                print(f"SYSTEM: Automated Email dispatch scheduled for alert {alert.rule_name}.")
            
            # Auto-escalate High/Critical alerts to Active Cases (Incidents)
            if alert_dict.get("severity", "").lower() in ["high", "critical"]:
                count = await db.incidents.count_documents({})
                incident_dict = {
                    "case_id": f"CAS-{count + 1:04d}",
                    "title": f"Auto-Escalated: {alert_dict.get('rule_name')} on {alert_dict.get('affected_host')}",
                    "severity": alert_dict.get("severity").lower(),
                    "status": "open",
                    "analyst_assigned": "Unassigned",
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                    "related_alerts": [alert_dict["_id"]],
                    "notes": [{
                        "timestamp": datetime.utcnow().isoformat(),
                        "author": "SIEM Automation",
                        "content": f"Automatically escalated due to {alert_dict.get('severity')} severity."
                    }]
                }
                await db.incidents.insert_one(incident_dict)
    except Exception as e:
        error_msg = f"ERROR: process_log_for_alerts failed: {e}\n{traceback.format_exc()}"
        print(error_msg)
        with open(r"c:\Users\user\Documents\project\backend_errors.log", "a") as f:
            f.write(f"[{datetime.utcnow()}] {error_msg}\n")

@router.post("", response_model=LogModel)
async def create_log(log: LogModel, background_tasks: BackgroundTasks, db=Depends(get_db)):
    log_dict = log.model_dump(by_alias=True, exclude_none=True)

    # ── KILL-SWITCH CHECK ──────────────────────────────────────────────────────
    # If this agent's hostname is in the blocked_agents list, return 410 GONE.
    # The agent script checks for this and exits cleanly.
    host = log_dict.get("details", {}).get("host") or ""
    if host:
        blocked = await db.blocked_agents.find_one({"hostname": host})
        if blocked:
            print(f"KILL-SWITCH: Rejected log from blocked agent '{host}'")
            raise HTTPException(status_code=410, detail=f"AGENT_TERMINATED: {host} has been disconnected by SIEM operator.")
    # ──────────────────────────────────────────────────────────────────────────

    if not isinstance(log_dict.get("timestamp"), datetime):
        if log_dict.get("timestamp"):
            try:
                log_dict["timestamp"] = datetime.fromisoformat(str(log_dict["timestamp"]).replace("Z", "+00:00"))
            except ValueError:
                log_dict["timestamp"] = datetime.utcnow()
        else:
            log_dict["timestamp"] = datetime.utcnow()

    result = await db.logs.insert_one(log_dict)
    log_dict["_id"] = str(result.inserted_id)

    # Broadcast new log to frontend immediately via WebSocket (no waiting)
    await manager.broadcast({
        "type": "NEW_LOG",
        "data": log_dict
    })

    print(f"SYSTEM: Ingested Log - ID: {log_dict.get('event_id')} | Proc: {log_dict.get('process_name')}")

    # Run detection pipeline in the BACKGROUND so this endpoint returns instantly
    background_tasks.add_task(process_log_for_alerts, log_dict, db)

    return log_dict

# ── Agent Management Endpoints ────────────────────────────────────────────────
@router.get("/agents")
async def list_agents(db=Depends(get_db)):
    """Returns list of blocked agents (for UI to show disconnect status)."""
    blocked = await db.blocked_agents.find({}).to_list(length=100)
    return [{"hostname": b["hostname"], "blocked_at": b.get("blocked_at")} for b in blocked]

@router.delete("/agents/{hostname}")
async def disconnect_agent(hostname: str, db=Depends(get_db)):
    """Blocks an agent by hostname. On next heartbeat the agent receives 410 and exits."""
    await db.blocked_agents.update_one(
        {"hostname": hostname},
        {"$set": {"hostname": hostname, "blocked_at": datetime.utcnow().isoformat()}},
        upsert=True
    )
    # Broadcast disconnect event to all dashboards
    await manager.broadcast({"type": "AGENT_DISCONNECTED", "data": {"hostname": hostname}})
    print(f"KILL-SWITCH: Agent '{hostname}' has been BLOCKED.")
    return {"status": "disconnected", "hostname": hostname, "message": f"Agent '{hostname}' will terminate on next heartbeat (within 3s)."}

@router.post("/agents/{hostname}/reconnect")
async def reconnect_agent(hostname: str, db=Depends(get_db)):
    """Removes a hostname from the blocklist, allowing it to reconnect."""
    await db.blocked_agents.delete_one({"hostname": hostname})
    await manager.broadcast({"type": "AGENT_RECONNECTED", "data": {"hostname": hostname}})
    print(f"KILL-SWITCH: Agent '{hostname}' has been UNBLOCKED.")
    return {"status": "reconnected", "hostname": hostname}
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/splunk")
async def ingest_splunk_webhook(payload: Dict[str, Any], db=Depends(get_db)):
    """
    Ingest logs forwarded from Splunk Alerts/Webhooks.
    Splunk payload structure varies, but usually contains 'result' or 'search_name'.
    We will extract the relevant fields and convert it to our internal LogModel.
    """
    result = payload.get("result", payload)
    
    # Map raw Splunk data into our expected SIEM schema
    mapped_log = {
        "timestamp": datetime.utcnow(),
        "event_id": result.get("EventCode") or result.get("event_id") or "SPLUNK-1",
        "ip_address": result.get("src_ip") or result.get("dest_ip") or result.get("ip_address") or "0.0.0.0",
        "process_name": result.get("process_name") or result.get("Image") or "splunk_forwarded",
        "command_line": result.get("CommandLine") or result.get("command_line") or "",
        "severity": result.get("severity") or "high",
        "details": {
            "source": result.get("source", "Splunk Webhook"),
            "host": result.get("host") or result.get("Computer") or "Unknown External Host",
            "raw": str(payload)
        }
    }
    
    # Validate against our pydantic model implicitly and insert
    db_result = await db.logs.insert_one(mapped_log)
    mapped_log["_id"] = str(db_result.inserted_id)
    
    # Broadcast to UI
    await manager.broadcast({
        "type": "NEW_LOG",
        "data": mapped_log
    })
    
    # Run through the Threat Detection Engine for Alert generation
    await process_log_for_alerts(mapped_log, db)
    
    return {"status": "success", "message": "Splunk log ingested and evaluated", "log_id": str(db_result.inserted_id)}

@router.post("/caldera")
async def ingest_caldera_webhook(payload: Dict[str, Any], db=Depends(get_db)):
    """
    Ingest adversary emulation results directly from a MITRE Caldera Server webhook.
    Identifies the agent IP, the technique executed, and integrates it.
    """
    # Caldera hooks often send a list of link executions or an agent dictionary
    # We will safely extract the core telemetry assuming a standard reporting hook
    agent_info = payload.get("paw", "unknown_agent")
    contact_ip = payload.get("host_ip") or payload.get("contact", "0.0.0.0")
    
    ability_name = payload.get("ability", {}).get("name", "Unknown Caldera Execution")
    mitre_tactic = payload.get("ability", {}).get("tactic", "multiple")
    mitre_technique = payload.get("ability", {}).get("technique_id", "T1000")
    
    command = payload.get("command", "")
    
    mapped_log = {
        "timestamp": datetime.utcnow(),
        "event_id": "CALDERA-1",
        "ip_address": contact_ip,
        "process_name": "caldera_agent.exe",
        "command_line": command,
        "severity": "critical", # Caldera emulations are inherently critical alerts
        "event_type": mitre_tactic.capitalize(),
        "details": {
            "source": "MITRE Caldera Server",
            "host": agent_info,
            "ability": ability_name,
            "technique_id": mitre_technique,
            "raw": str(payload)
        }
    }
    
    # Insert safely into logs collection
    db_result = await db.logs.insert_one(mapped_log)
    mapped_log["_id"] = str(db_result.inserted_id)
    
    # Broadcast to UI immediately
    await manager.broadcast({
        "type": "NEW_LOG",
        "data": mapped_log
    })
    
    # Because Caldera alerts map strictly to abilities rather than standard event patterns, 
    # we dynamically generate an override Alert specifically for external payloads.
    try:
        from ..models.schemas import AlertModel
        alert = AlertModel(
            rule_id="caldera-external-override",
            rule_name=f"Caldera Emulation: {ability_name}",
            severity="critical",
            mitre_attack_id=mitre_technique,
            affected_host=agent_info,
            source_ip=contact_ip,
            triggered_time=datetime.utcnow().isoformat() + "Z",
            matching_logs=1,
            log_ids=[str(db_result.inserted_id)],
            status="new"
        )
        if alert.source_ip:
            alert.threat_intel = {"score": 95, "status": "malicious"} # Emulations are generally tracked as malicious for mock UI
            
        alert_dict = alert.model_dump(by_alias=True, exclude_none=True)
        if not isinstance(alert_dict.get("triggered_time"), datetime):
            alert_dict["triggered_time"] = datetime.utcnow()
            
        alert_db_result = await db.alerts.insert_one(alert_dict)
        alert_dict["_id"] = str(alert_db_result.inserted_id)
        alert_dict["id"] = alert_dict["_id"]
        
        # Broadcast the alert
        await manager.broadcast({
            "type": "NEW_ALERT",
            "data": alert_dict
        })
    except Exception as e:
        print(f"Error generating Caldera Override alert: {e}")
    
    return {"status": "success", "message": f"Caldera execution '{ability_name}' intercepted", "log_id": str(db_result.inserted_id)}

@router.get("")
async def get_logs(limit: int = 100, skip: int = 0, db=Depends(get_db)):
    cursor = db.logs.find().sort("timestamp", -1).skip(skip).limit(limit)
    logs = await cursor.to_list(length=limit)
    for log in logs:
        log["id"] = str(log["_id"])
        log["_id"] = str(log["_id"])
    return logs

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open, wait for any messages from client if needed
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

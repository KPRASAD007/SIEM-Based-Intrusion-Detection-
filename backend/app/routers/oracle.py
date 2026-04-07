from fastapi import APIRouter, Depends
from ..database import get_db
from ..services.email_service import send_alert_email
from ..models.schemas import AlertModel
import re
import datetime

router = APIRouter(prefix="/api/oracle", tags=["oracle"])

@router.post("/chat")
async def chat_with_oracle(payload: dict, db = Depends(get_db)):
    message = payload.get("message", "").lower()
    
    # Base styling response
    response_text = ""
    action_taken = None
    
    # 1. Status / Health checking
    if "status" in message or "health" in message or "overview" in message:
        # Fetch actual DB stats
        total = await db.alerts.count_documents({})
        critical = await db.alerts.count_documents({"severity": {"$regex": "^critical$", "$options": "i"}})
        
        response_text = f"Sir, I have analyzed the current telemetry. We have a total of {total} events documented. Currently, there are {critical} CRITICAL level threats demanding immediate attention. The perimeter is holding, but vigilance is recommended."
        action_taken = "STATUS_REPORT_COMPILED"
        
    # 2. Critical threat analysis
    elif "critical" in message or "worst" in message or "highest" in message:
        cursor = db.alerts.find({"severity": {"$regex": "^critical$", "$options": "i"}}).limit(3)
        critical_alerts = await cursor.to_list(length=3)
        if critical_alerts:
            threats = ", ".join([f"{a.get('rule_name', 'Unknown')} (Vector: {a.get('source_ip', 'Unknown')})" for a in critical_alerts])
            response_text = f"I have isolated the most pressing threats. The highest priority vectors are: {threats}. Shall I initiate containment protocols?"
        else:
            response_text = "Good news, sir. I am detecting zero critical threats in the current operational timeframe."
        action_taken = "THREAT_MATRIX_ANALYZED"
        
    # 3. Containment / Isolation (SOAR simulation)
    elif "isolate" in message or "contain" in message or "ban" in message or "block" in message:
        # Extract potential IP
        ip_match = re.search(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', message)
        target = ip_match.group(0) if ip_match else "the hostile vector"
        
        response_text = f"Acknowledged. Executing automated SOAR playbook. I am overriding firewall rule-sets and dropping all packets from {target}. Containment parameter established."
        action_taken = f"SOAR_CONTAINMENT_LOCKED: {target}"
    
    # 4. Honey Token / Deception
    elif "deception" in message or "honey" in message or "fake" in message:
        response_text = "I am monitoring the deception grid. Our deployed honey-tokens and mock servers remain undetected. Adversary traversal into the mirage network is being actively tracked."
        action_taken = "DECEPTION_GRID_VERIFIED"
        
    # 5. Email / Notification Dispatch
    elif "email" in message or "mail" in message or "notify" in message or "alert team" in message:
        # Actually trigger for the most recent critical alert if possible
        cursor = db.alerts.find({"severity": {"$regex": "^critical$", "$options": "i"}}).sort("triggered_time", -1).limit(1)
        alerts_list = await cursor.to_list(length=1)
        if alerts_list:
            # Reconstruct AlertModel for the service
            alert_data = alerts_list[0]
            # Handle potential dict vs model mapping
            from pydantic import TypeAdapter
            ta = TypeAdapter(AlertModel)
            try:
                # Clean up _id for pydantic
                if "_id" in alert_data: alert_data["id"] = str(alert_data["_id"])
                alert_obj = ta.validate_python(alert_data)
                # Call the service
                await send_alert_email(alert_obj, db)
                response_text = "Alert dispatch protocol initiated. I have compiled the current threat matrix and forwarded a high-priority briefing to all registered Level-5 SOC operators' secure mailboxes."
            except Exception as e:
                print(f"DEBUG Oracle Email Trigger Error: {e}")
                response_text = "Sir, I attempted to dispatch the briefing, but encountered a protocol error in the SMTP uplink. Please verify server connection."
        else:
             response_text = "I would proceed with the dispatch, but the threat matrix currently shows zero critical events worthy of notification."
        action_taken = "SMTP_DISPATCH_TRIGGERED"
        
    # 6. Guide / Help / Documentation
    elif "guide" in message or "help" in message or "how to" in message or "explain" in message:
        response_text = "I can guide you through the facility. \n1. [SIMULATOR]: Use this to launch controlled AI attacks against our sensors.\n2. [DECEPTION OPS]: Deploy fake honey-tokens to trap adversaries.\n3. [THREAT ALERTS]: Review live intrusion signals.\n4. [COMMAND CENTER]: View macroscopic threat telemetry.\nWhat system would you like to initialize?"
        action_taken = "DOCUMENTATION_PULLED"
        
    # 7. Clear / Reset
    elif "clear" in message or "reset" in message:
        response_text = "Flushing local memory buffers and resetting interface protocols. Standing by for new directives."
        action_taken = "SYSTEM_RESET"
        
    # Default Fallback (Conversational)
    else:
        responses = [
            "I'm sorry sir, I require more specific parameters for that directive.",
            "Processing... The databanks are continuously monitoring the perimeter. How else may I assist?",
            "My neural net is calibrated for threat detection. Please specify a security operation.",
            "I am O.R.A.C.L.E. (Operational Response & Automated Cyber Logic Engine). I am integrated into the central security nervous system. Awaiting your command."
        ]
        import random
        response_text = random.choice(responses)
        action_taken = "AWAITING_INPUT"
        
    return {
        "reply": response_text,
        "action": action_taken,
        "timestamp": datetime.datetime.now().isoformat()
    }

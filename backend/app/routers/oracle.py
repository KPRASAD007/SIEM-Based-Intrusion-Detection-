from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
import re
import datetime

router = APIRouter(prefix="/api/oracle", tags=["oracle"])

@router.post("/chat")
async def chat_with_oracle(payload: dict, db: Session = Depends(get_db)):
    message = payload.get("message", "").lower()
    
    # Base styling response
    response_text = ""
    action_taken = None
    
    # 1. Status / Health checking
    if "status" in message or "health" in message or "overview" in message:
        # Fetch actual DB stats using raw SQL for simplicity since we don't have models imported easily here without circular loops
        total = db.execute("SELECT COUNT(*) FROM alerts").scalar()
        critical = db.execute("SELECT COUNT(*) FROM alerts WHERE LOWER(severity) = 'critical'").scalar()
        
        response_text = f"Sir, I have analyzed the current telemetry. We have a total of {total} events documented. Currently, there are {critical} CRITICAL level threats demanding immediate attention. The perimeter is holding, but vigilance is recommended."
        action_taken = "STATUS_REPORT_COMPILED"
        
    # 2. Critical threat analysis
    elif "critical" in message or "worst" in message or "highest" in message:
        critical_alerts = db.execute("SELECT rule_name, source_ip FROM alerts WHERE LOWER(severity) = 'critical' LIMIT 3").fetchall()
        if critical_alerts:
            threats = ", ".join([f"{a[0]} (Vector: {a[1]})" for a in critical_alerts])
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
        
    # 5. Clear / Reset
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

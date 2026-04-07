from fastapi import APIRouter, Depends
from ..database import get_db
from ..services.email_service import send_alert_email
from ..models.schemas import AlertModel
import re
import datetime

router = APIRouter(prefix="/api/oracle", tags=["oracle"])

@router.post("/chat")
@router.post("/chat")
@router.post("/chat")
@router.post("/chat")
async def chat_with_oracle(payload: dict, db = Depends(get_db)):
    message = payload.get("message", "").lower()
    
    # Vanguard Personality 3.0: Active Neural Mentor
    response_text = ""
    action_taken = None

    # --- LIVE THREAT SENSING (Always check for real-time telemetry first) ---
    latest_threat = await db.alerts.find({"severity": {"$regex": "^critical$|^high$", "$options": "i"}}).sort("triggered_time", -1).limit(1).to_list(length=1)
    target_ip = latest_threat[0].get('source_ip', 'UNDEFINED') if latest_threat else None
    target_host = latest_threat[0].get('hostname', 'REMOTE_NODE') if latest_threat else None
    target_rule = latest_threat[0].get('rule_name', 'Suspicious Activity') if latest_threat else None

    # --- MENTION HANDLERS (Guidance for Freshers - LIVE SENSITIVE) ---
    if "@attack simulator" in message or "@simulator" in message:
        response_text = (
            "CORE MODULE: ATTACK SIMULATOR (WALKTHRU)\n"
            "Fresher Directive: Integrated testing for defense verification.\n"
            "1. Launch a 'Brute Force' payload.\n"
            "2. Switch to **Threat Alerts** instantly. You should see a new signal from '127.0.0.1'.\n"
            "3. If successful, Vanguard will relay a high-priority SOC intercept to your mail.\n\n"
            "**SIMPLIFIED INSIGHT:** Think of this as a 'fire drill'. Use it to make sure your alarms are actually working."
        )
        action_taken = "SOP_GUIDANCE_SIMULATOR"

    elif "@log analyzer" in message or "@analyzer" in message or "how to check" in message:
        if target_ip:
            response_text = (
                f"LIVE FORENSICS: Detected active strike vector from **{target_ip}** ({target_host}).\n"
                "Analytical SOP for Freshers:\n"
                f"1. Navigate to **Log Analyzer** and query for filter: `ip_address == {target_ip}`.\n"
                "2. Look for the 'process_name' associated with this event—it likely indicates an unauthorized shell or worm.\n"
                "3. Review the 'Raw Data' for unique strings (IOCs) to determine the attacker's intent.\n\n"
                f"**SIMPLIFIED INSIGHT:** I'm seeing a real threat from {target_ip}. Go to the 'Log Analyzer' and type that IP in the search box to see exactly what they are doing to us."
            )
        else:
            response_text = (
                "LOG ANALYZER SOP (STDBY MODE):\n"
                "1. Filter by 'Critical' severity.\n"
                "2. Cross-reference the IP with our Threat Intel module for reputation scoring.\n\n"
                "**SIMPLIFIED INSIGHT:** Use this page to find specific hackers by their IP address. Since we have no live attacks right now, the database is clean."
            )
        action_taken = "SOP_GUIDANCE_ANALYZER_LIVE"

    elif "ban" in message or "block" in message or "isolate" in message or "contain" in message:
        if target_ip:
            response_text = (
                f"THREAT NEUTRALIZATION DIRECTIVE: Hostile IP **{target_ip}** isolated.\n"
                "Standard Containment Procedure:\n"
                f"1. Acknowledge the alert for `{target_rule}`.\n"
                "2. Elevate the alert into a formal **Incident Case**.\n"
                f"3. Declare to me: 'Vanguard, block {target_ip}'. I will then sever its neural uplink to our facility.\n\n"
                f"**SIMPLIFIED INSIGHT:** I've identified the attacker at {target_ip}. To stop them, first go to 'Cases' and start an investigation, then tell me to block them!"
            )
        else:
            response_text = (
                "CONTAINMENT SOP (NO ACTIVE THREATS):\n"
                "1. Identify the hostile source IP from the alerts list.\n"
                "2. Use the 'SOAR' actions in Case Management to drop traffic.\n\n"
                "**SIMPLIFIED INSIGHT:** If a hacker shows up, I'll give you their IP and you can tell me 'block that IP' to kick them out instantly."
            )
        action_taken = "SOP_CONTAINMENT_DIRECTIVE"

    elif "@deception ops" in message or "@deception" in message:
        response_text = (
            "CORE MODULE: DECEPTION OPS (STRATEGY)\n"
            "Fresher Directive: Deploy traps for lateral movement detection.\n"
            "1. Deploy a Honey-Token on your target host.\n"
            "2. If any process attempts to open it, Vanguard will trigger a SILENT ALERT.\n"
            "3. Use this to catch hackers as they try to move between PCs.\n\n"
            "**SIMPLIFIED INSIGHT:** You can set 'fake' files. If a hacker on your other PC tries to touch them, I will alert you immediately."
        )
        action_taken = "SOP_GUIDANCE_DECEPTION"

    # --- STANDARD RESPONSES (Unified Health Sync) ---
    elif any(k in message for k in ["status", "health", "overview", "report"]):
        total_logs = await db.logs.count_documents({})
        critical = await db.alerts.count_documents({"severity": {"$regex": "^critical$", "$options": "i"}})
        
        status_msg = "FACILITY IS SECURE." if critical == 0 else "FACILITY UNDER ACTIVE ASSAULT."
        response_text = (
            f"Vanguard Sentinel {status_msg} logs: {total_logs}. Critical intercepts: {critical}.\n"
            f"Latest detected vector: {target_ip if target_ip else 'NONE'}.\n\n"
            f"**SIMPLIFIED INSIGHT:** We've scanned {total_logs} items. We have {critical} dangerous threats. {f'The most recent one is from {target_ip}' if target_ip else 'Everything looks clean right now.'}"
        )
        action_taken = "STATUS_REPORT"

    else:
        response_text = (
            "Vanguard Neural Interface online. How can I assist with your real-time defense operations? Use '+' to mention a module.\n\n"
            "**SIMPLIFIED INSIGHT:** I am watching your PC for real attacks. If someone from your other computer tries to break in, I will tell you exactly what to do."
        )
        action_taken = "SENTINEL_IDLE"

    return {
        "reply": response_text,
        "action": action_taken,
        "timestamp": datetime.datetime.now().isoformat()
    }




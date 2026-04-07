# 🛡️ Vanguard AI: CyberDetect Lab Platform

> **The Next-Gen Security Operations Center (SOC) Simulation and Threat Detection Engine.**

Vanguard AI CyberDetect Lab is a full-stack SIEM (Security Information and Event Management) platform purpose-built for modern security engineering. It combines real-time physical endpoint telemetry, behavioral analytics (UEBA), proactive deception technology, and Level-3 Artificial Intelligence enrichments into a unified, high-tech dashboard.

---

## 🚀 Core Infrastructure & Tech Stack

*   **⚡ Backend**: `FastAPI` (Python 3.12+) - High-performance asynchronous API engine.
*   **⚛️ Frontend**: `React 18` + `Vite` - Ultra-responsive, hacker-inspired UI with `Lucide-React` iconography.
*   **📡 Streaming**: `WebSockets` - Instant bi-directional telemetry from physical remote agents directly to the SOC frontend under sub-second latency.
*   **📦 Database**: `MongoDB` (using `Motor` for async I/O) - Agile document store for billions of logs.
*   **🧠 Intelligence**: Integrated **Live IP Geolocation**, **L3 AI Oracle Assistant**, and **MITRE ATT&CK** Mapping.

---

## 🛠️ System Overview & Capabilities

### 1. 📊 Remote Sensors & Telemetry (Physical Endpoint Agents)
*   Deploy persistent, deep-scan forwarder agents onto physical Windows machines across local LANs or VPNs.
*   **Autodiscovery**: Dashboard auto-detects connecting hosts, building a live topology map.
*   **Kill-Switch Integration**: Security Operators can hit **[ DISCONNECT ]** on the backend to immediately send an HTTP `410 Gone` shutdown signal, permanently killing the agent's connection.

### 2. 🌍 Threat Intelligence & Geolocation
*   **Cyber Intel Enrichment**: 1-click playbook enrichment runs full IP intelligence scans (City, ISP, ASN, Hosting/Proxy detection) using `ip-api`. Automatically detects and bypasses reserved internal network spaces (like Tailscale/LAN).

### 3. 🧠 The "Oracle" L3 Investigation Assistant
*   AI-powered copilot integrated directly into the case management and alerts interface.
*   The Oracle analyzes raw JSON payloads, firewall logs, and Windows Event IDs to summarize threats and recommend immediate SOAR remediation logic.

### 4. 🎮 Physical Attack Simulation Engine
Safely emulate adversary behavior physically or virtually to test your detection rules:
*   **Synthetic Backend Injection**: Simulate Ransomware, Lateral Movement, or Suricata IDS logs instantly from the dashboard.
*   **Physical Agent Execution**: By running tools like `mimikatz.exe`, `psexec.exe`, or `nmap.exe` directly on the provisioned Second Computer, the Vanguard AI agent will flag the process execution and stream a High-Severity alert directly to the SOC.
*   **Physical Brute-Force Monitoring**: Lock the screen on the second PC and enter a wrong password 5 times in 60 seconds (generating Event ID 4625). The Stateful Detection Engine will instantly aggregate the logs and trigger a `T1110.001` Brute Force alert.

### 5. 🎭 Deception Ops (Honeypots)
*   **Silent Traps**: Professional-grade decoy login portals hosted by the SIEM (e.g., `/vpn`, `/portal`, `/secure-auth`).
*   Interaction with these trap URLs captures adversary credentials and headers without altering the attacker, generating a **Priority-One Breach Alert**.

---

## ⚡ Deployment & Setup Guide

### 1. Clone & Prereqs
Ensure you have **Python 3.12**, **Node.js**, and **MongoDB** installed locally.

### 2. Startup: Backend
```powershell
cd backend
# Activate your VENV
.\venv312\Scripts\Activate.ps1
# Install dependencies
pip install -r requirements.txt
# Launch the API
uvicorn app.main:app --reload --port 8080 --host 0.0.0.0
```

### 3. Startup: Frontend
```powershell
cd frontend
# Install packages
npm install
# Start dev server
npm run dev
```
*Access the UI at: http://localhost:5173* (Default login: `admin` / `admin`)

### 4. Deploying Remote Agents (Second Computer)
Go to the **Remote Sensors** tab in the Vanguard AI Dashboard and copy your dynamic Provisioning Command. Paste it into an Administrator PowerShell on the target machine:
```powershell
$env:SIEM_IP="[AUTO-DETECTED-IP]"; iwr -useb "http://[AUTO-DETECTED-IP]:8080/api/download/agent" | iex
```

---

## 🧬 Project Roadmap
- [x] Real-time WebSocket Ingestion
- [x] L3 AI Oracle Threat Intel Enrichment 
- [x] Deception Node / VIP Target Traps
- [x] Physical Remote Agent Telemetry
- [x] Agent Kill-Switch & Extrication
- [x] Stateful Event 4625 Brute Force Detection
- [ ] Automated SOAR Process Termination (Killing malicious PIDs via Agent)
- [ ] Cloud-Source Ingestion (AWS/Azure)

---
**Created by KPRASAD007 & Project Team**  
*Empowering Next-Gen Defenders with Vanguard AI.*


# 🛡️ CyberDetect Lab: Advanced AI-SIEM & Deception Platform

> **The Next-Gen Security Operations Center (SOC) Simulation and Threat Detection Engine.**

CyberDetect Lab is a full-stack SIEM (Security Information and Event Management) platform purpose-built for modern security engineering. It combines real-time event streaming, behavioral analytics (UEBA), and proactive deception technology into a unified, high-tech dashboard.

---

## 🚀 Core Infrastructure & Tech Stack

*   **⚡ Backend**: `FastAPI` (Python 3.12+) - High-performance asynchronous API engine.
*   **⚛️ Frontend**: `React 18` + `Vite` - Ultra-responsive, hacker-inspired UI with `Lucide-React` iconography.
*   **📡 Streaming**: `WebSockets` - Instant bi-directional telemetry from backend to frontend.
*   **📦 Database**: `MongoDB` (using `Motor` for async I/O) - Agile document store for billions of logs.
*   **🧠 Intelligence**: Integrated **Sigma Parser** & **MITRE ATT&CK** Mapping.

---

## 🛠️ System Sections & How to Use

### 1. 📊 Command Center (Real-Time SOC)
**Use**: The primary dashboard for monitoring the entire network's health.
*   **Features**: Interactive alert volume charts, real-time log ingestion stream, and global severity distribution (Critical, High, Medium, Low).
*   **Workflow**: When an alert appears in red, click the "Investigate" button to open the Case Manager.

### 2. 🎮 Live Fire Sim (Attack Simulator)
**Use**: Safely emulate adversary behavior to test your detection rules.
*   **Sections**:
    *   **Standard Scenarios**: Choose from `LSASS Dumping`, `Ransomware Behavior`, or `PowerShell Obfuscation`.
    *   **CALDERA_AGENT_MOCK**: Simulate advanced C2 (Command & Control) signal injection (e.g., UAC Bypass).
*   **Result**: Executing a simulation will instantly trigger detection events in the Command Center.

### 3. 🎭 Deception Ops (The Traps)
**Use**: Catch hackers "red-handed" using proactive decoys.
*   **Honey-Assets**: Deploy fake server nodes (Active Deception Nodes). Interaction with these IP addresses triggers a **Priority-One Breach Alert**.
*   **Honey-Tokens**: Generate "fake" SQL credentials or AWS keys. Seeding these in your environment creates a digital tripwire for thieves.

### 4. 🧠 Behavioral Analytics (UEBA)
**Use**: Identify "Inside Threats" by detecting abnormal user activity.
*   **Anomalies**: Detects unusual login times or volume spikes (e.g., an admin logging in at 3:00 AM after months of silence).

### 5. 📂 Forensics & Case Manager
**Use**: Standardized Incident Response (IR) workflow.
*   **Features**: Auto-escalation of critical alerts, analyst assignment, and collaborative note-taking for audit trials.

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
uvicorn app.main:app --reload --port 8080 --host 127.0.0.1
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
To monitor a physical second machine, download the agent on that machine:
```powershell
# From the target machine
irm "http://YOUR_SIEM_IP:8080/api/download/RemoteLogForwarder.ps1" -OutFile "C:\RemoteLogForwarder.ps1"
# Run as Admin
C:\RemoteLogForwarder.ps1 -ServerIP "YOUR_SIEM_IP" -Continuous
```

---

## 🧬 Project Roadmap
- [x] Real-time WebSocket Ingestion
- [x] Automated Case Escalation
- [x] Deception Node Deployment Engine
- [x] Sigma Rule Conversion (Mock)
- [ ] SOAR Auto-Containment Actions
- [ ] Cloud-Source Ingestion (AWS/Azure)

---
**Created by KPRASAD007 & Project Team**  
*Empowering Next-Gen Defenders.*

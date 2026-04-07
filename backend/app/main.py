from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from .database import connect_to_mongo, close_mongo_connection, get_db
from .routers import logs, rules, alerts, incidents, simulator, search, auth, threat_intel, soar, deception, behavior, sigma, oracle
import os

app = FastAPI(
    title="CyberDetect Lab API",
    description="Backend for the Security Operations Center (SOC) Dashboard",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving
app.mount("/api/download", StaticFiles(directory="app/static"), name="static")

# Core Routers
app.include_router(logs.router)
app.include_router(rules.router)
app.include_router(alerts.router)
app.include_router(incidents.router)
app.include_router(threat_intel.router)
app.include_router(soar.router)
app.include_router(simulator.router)
app.include_router(search.router)
app.include_router(auth.router)

# Advanced Module Routers (Temporary Bypass if needed can be done here)
app.include_router(deception.router)
app.include_router(behavior.router)
app.include_router(sigma.router)
app.include_router(oracle.router)

# ── Honeypot URL Aliases ───────────────────────────────────────────────────────
# These look like real corporate systems to a threat actor.
# All serve the same fake login page. Choose whichever URL you share as bait.
_HONEYPOT_HTML = os.path.join(os.path.dirname(__file__), "static", "honeypot.html")

def _serve_honeypot():
    with open(_HONEYPOT_HTML, "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/vpn",           response_class=HTMLResponse, include_in_schema=False)
async def hp_vpn():        return _serve_honeypot()

@app.get("/portal",        response_class=HTMLResponse, include_in_schema=False)
async def hp_portal():     return _serve_honeypot()

@app.get("/admin/login",   response_class=HTMLResponse, include_in_schema=False)
async def hp_admin():      return _serve_honeypot()

@app.get("/signin",        response_class=HTMLResponse, include_in_schema=False)
async def hp_signin():     return _serve_honeypot()

@app.get("/remote",        response_class=HTMLResponse, include_in_schema=False)
async def hp_remote():     return _serve_honeypot()

@app.get("/webmail",       response_class=HTMLResponse, include_in_schema=False)
async def hp_webmail():    return _serve_honeypot()

@app.get("/citrix",        response_class=HTMLResponse, include_in_schema=False)
async def hp_citrix():     return _serve_honeypot()

@app.get("/sso",           response_class=HTMLResponse, include_in_schema=False)
async def hp_sso():        return _serve_honeypot()
# ──────────────────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_db_client():
    # Attempting DB connection but not blocking if it's slow
    import asyncio
    print("SYSTEM: Initializing background DB tasks...")
    asyncio.create_task(connect_to_mongo())

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"status": "online", "message": "CyberDetect Lab API is operational"}

@app.get("/api/system/info")
async def system_info():
    """Returns real network IPs of this SIEM server so agents can connect correctly."""
    import socket
    ips = {}
    try:
        # Get all network interfaces
        hostname = socket.gethostname()
        ips["hostname"] = hostname
        # Get all IPs bound to this machine
        all_ips = socket.getaddrinfo(hostname, None)
        unique = list({addr[4][0] for addr in all_ips if ':' not in addr[4][0] and addr[4][0] != '127.0.0.1'})
        ips["all_ips"] = unique

        # Get the primary outbound IP (what other machines see)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ips["primary_ip"] = s.getsockname()[0]
        s.close()

        # Detect Tailscale IP (100.x.x.x range)
        tailscale = [ip for ip in unique if ip.startswith("100.")]
        ips["tailscale_ip"] = tailscale[0] if tailscale else None

        # Detect LAN IP (192.168.x.x or 10.x.x.x)
        lan = [ip for ip in unique if ip.startswith("192.168.") or ip.startswith("10.")]
        ips["lan_ip"] = lan[0] if lan else None

    except Exception as e:
        ips["error"] = str(e)

    return ips

@app.get("/api/debug/seed")
async def manual_seed(db=Depends(get_db)):
    if not db:
        return {"status": "error", "message": "Database not connected"}
    return {"status": "success", "message": "Seeding logic is ready."}

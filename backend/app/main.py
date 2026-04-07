from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import connect_to_mongo, close_mongo_connection, get_db
from .routers import logs, rules, alerts, incidents, simulator, search, auth, threat_intel, soar, deception, behavior, sigma, oracle

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

@app.get("/api/debug/seed")
async def manual_seed(db=Depends(get_db)):
    if not db:
        return {"status": "error", "message": "Database not connected"}
    # Simplified seed for brevity here, full seeding is in the routers
    return {"status": "success", "message": "Seeding logic is ready."}

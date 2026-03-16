from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import connect_to_mongo, close_mongo_connection
from .routers import logs, rules, alerts, incidents, simulator, search, auth, threat_intel, soar

app = FastAPI(
    title="CyberDetect Lab API",
    description="Backend for the Security Operations Center (SOC) Dashboard",
    version="1.0.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(logs.router)
app.include_router(rules.router)
app.include_router(alerts.router)
app.include_router(incidents.router)
app.include_router(threat_intel.router)
app.include_router(soar.router)
app.include_router(simulator.router)
app.include_router(search.router)
app.include_router(auth.router)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "CyberDetect Lab API is running"}

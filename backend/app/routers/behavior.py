from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..database import get_db
from datetime import datetime

router = APIRouter(prefix="/api/behavior", tags=["behavior"])

class UserProfile(BaseModel):
    user: str
    risk_score: int
    daily_actions: List[int] # Volume of logs per day for last 7 days
    top_commands: List[str]
    last_seen: str

class Anomaly(BaseModel):
    user: str
    type: str # unusual_time, high_volume, dark_web_leak
    description: str
    timestamp: str
    severity: str

@router.get("/profiles", response_model=List[UserProfile])
async def get_user_profiles():
    db = get_db()
    cursor = db.user_profiles.find({})
    profiles = await cursor.to_list(length=100)
    return profiles

@router.get("/anomalies", response_model=List[Anomaly])
async def get_anomalies():
    db = get_db()
    cursor = db.anomalies.find({})
    anomalies = await cursor.to_list(length=100)
    return anomalies

@router.post("/anomalies")
async def trigger_anomaly(anomaly: Anomaly):
    db = get_db()
    anomaly_dict = anomaly.dict()
    await db.anomalies.insert_one(anomaly_dict)
    return {"message": "Anomaly recorded"}

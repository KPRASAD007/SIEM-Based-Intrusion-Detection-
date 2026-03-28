from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..database import get_db
from datetime import datetime

router = APIRouter(prefix="/api/deception", tags=["deception"])

class HoneyAsset(BaseModel):
    name: str
    type: str # server, database, workstation
    ip: str
    status: str # active, breached, offline
    last_interaction: Optional[str] = None

class HoneyToken(BaseModel):
    name: str
    value: str
    type: str # credential, file, api_key
    risk_score: int

@router.get("/assets", response_model=List[HoneyAsset])
async def get_honey_assets():
    db = get_db()
    cursor = db.honey_assets.find({})
    assets = await cursor.to_list(length=100)
    return assets

@router.get("/tokens", response_model=List[HoneyToken])
async def get_honey_tokens():
    db = get_db()
    cursor = db.honey_tokens.find({})
    tokens = await cursor.to_list(length=100)
    return tokens

@router.post("/assets")
async def create_honey_asset(asset: HoneyAsset):
    db = get_db()
    asset_dict = asset.dict()
    await db.honey_assets.insert_one(asset_dict)
    return {"message": "HoneyAsset created successfully"}

@router.post("/tokens")
async def create_honey_token(token: HoneyToken):
    db = get_db()
    token_dict = token.dict()
    await db.honey_tokens.insert_one(token_dict)
    return {"message": "HoneyToken created successfully"}

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId

from ..database import get_db
from ..models.schemas import RuleModel

router = APIRouter(prefix="/api/rules", tags=["Rules"])

@router.post("", response_model=RuleModel)
async def create_rule(rule: RuleModel, db=Depends(get_db)):
    rule_dict = rule.model_dump(by_alias=True, exclude_none=True)
    result = await db.rules.insert_one(rule_dict)
    rule_dict["_id"] = str(result.inserted_id)
    return rule_dict

@router.get("")
async def get_rules(db=Depends(get_db)):
    cursor = db.rules.find().sort("name", 1)
    rules = await cursor.to_list(length=100)
    for rule in rules:
        rule["id"] = str(rule["_id"])
        rule["_id"] = str(rule["_id"])
    return rules

@router.delete("/{id}")
async def delete_rule(id: str, db=Depends(get_db)):
    result = await db.rules.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"status": "success"}

@router.put("/{id}/toggle")
async def toggle_rule(id: str, db=Depends(get_db)):
    rule = await db.rules.find_one({"_id": ObjectId(id)})
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    new_status = not rule.get("is_active", True)
    await db.rules.update_one({"_id": ObjectId(id)}, {"$set": {"is_active": new_status}})
    
    rule["is_active"] = new_status
    rule["id"] = str(rule["_id"])
    rule["_id"] = str(rule["_id"])
    return rule

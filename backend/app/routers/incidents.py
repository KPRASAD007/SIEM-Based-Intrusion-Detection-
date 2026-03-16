from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId
from datetime import datetime

from ..database import get_db
from ..models.schemas import IncidentModel

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

@router.get("")
async def get_incidents(db=Depends(get_db)):
    cursor = db.incidents.find().sort("created_at", -1)
    incidents = await cursor.to_list(length=50)
    for inc in incidents:
        inc["id"] = str(inc["_id"])
        inc["_id"] = str(inc["_id"])
    return incidents

@router.post("")
async def create_incident(incident: IncidentModel, db=Depends(get_db)):
    inc_dict = incident.model_dump(by_alias=True, exclude_none=True)
    
    # Generate case ID if not provided
    if "case_id" not in inc_dict or not inc_dict["case_id"]:
        count = await db.incidents.count_documents({})
        inc_dict["case_id"] = f"CAS-{count + 1:04d}"
        
    result = await db.incidents.insert_one(inc_dict)
    inc_dict["_id"] = str(result.inserted_id)
    return inc_dict

@router.put("/{id}/notes")
async def add_incident_note(id: str, note_content: str, author: str = "Analyst", db=Depends(get_db)):
    note = {
        "timestamp": datetime.utcnow().isoformat(),
        "author": author,
        "content": note_content
    }
    result = await db.incidents.update_one(
        {"_id": ObjectId(id)},
        {"$push": {"notes": note}, "$set": {"updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
         raise HTTPException(status_code=404, detail="Incident not found")
    return note
@router.put("/{id}/status")
async def update_incident_status(id: str, status: str, db=Depends(get_db)):
    result = await db.incidents.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
         raise HTTPException(status_code=404, detail="Incident not found")
    return {"status": "success", "new_status": status}

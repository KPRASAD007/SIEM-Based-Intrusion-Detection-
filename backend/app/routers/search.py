from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from ..database import get_db

router = APIRouter(prefix="/api/search", tags=["Threat Hunting"])

def parse_query_to_mongo(query_string: str) -> Dict[str, Any]:
    """
    Very basic query parser for:
    process_name:powershell.exe AND command_line:*enc*
    """
    if not query_string:
        return {}
        
    mongo_query = {}
    
    # Split by AND for now
    parts = query_string.split(" AND ")
    for part in parts:
        if ":" in part:
            field, value = part.split(":", 1)
            field = field.strip()
            value = value.strip()
            
            # Map common fields to DB fields if needed
            if field == "command_line":
                field = "details.command_line"
                
            # Handle wildcards
            if "*" in value:
                value = value.replace("*", ".*")
                mongo_query[field] = {"$regex": value, "$options": "i"}
            else:
                mongo_query[field] = value
                
    return mongo_query

@router.get("")
async def threat_hunt(query: str, limit: int = 100, db=Depends(get_db)):
    try:
        mongo_filter = parse_query_to_mongo(query)
    except Exception as e:
         raise HTTPException(status_code=400, detail=f"Invalid query format: {str(e)}")
         
    cursor = db.logs.find(mongo_filter).sort("timestamp", -1).limit(limit)
    logs = await cursor.to_list(length=limit)
    for log in logs:
        log["id"] = str(log["_id"])
        log["_id"] = str(log["_id"])
    return logs

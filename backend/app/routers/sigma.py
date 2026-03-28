from fastapi import APIRouter, HTTPException, UploadFile, File
# import yaml
from typing import Dict, Any
from ..database import get_db

router = APIRouter(prefix="/api/sigma", tags=["sigma"])

def convert_sigma_to_mongo(sigma_yaml: Dict[Any, Any]) -> Dict[str, Any]:
    """
    Highly simplified Sigma to MongoDB query converter.
    Sigma format: 
    detection:
      selection:
        EventID: 4624
        LogonType: 3
      condition: selection
    """
    detection = sigma_yaml.get('detection', {})
    selection = detection.get('selection', {})
    
    # In a real system, we'd use 'pySigma'
    # Here we map a single selection to our flat rule format
    field = next(iter(selection.keys())) if selection else "process_name"
    value = str(selection.get(field)) if selection else "unknown"
    
    return {
        "name": sigma_yaml.get('title', 'Imported Sigma Rule'),
        "description": sigma_yaml.get('description', 'Converted from Sigma YAML'),
        "field": field.lower(),
        "operator": "equals",
        "value": value,
        "severity": sigma_yaml.get('level', 'high'),
        "mitre_attack_id": sigma_yaml.get('tags', ['T1000'])[0] if sigma_yaml.get('tags') else "T1000",
        "is_active": True
    }

@router.post("/convert")
async def import_sigma(rule_yaml: str):
    try:
        # data = yaml.safe_load(rule_yaml)
        data = {"title": "Placeholder Rule", "description": "Sigma Parser requires PyYAML to be fixed in the environment."}
        mongo_rule = convert_sigma_to_mongo(data)
        
        db = get_db()
        await db.rules.insert_one(mongo_rule)
        
        return {"status": "success", "rule": mongo_rule}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Sigma YAML: {str(e)}")

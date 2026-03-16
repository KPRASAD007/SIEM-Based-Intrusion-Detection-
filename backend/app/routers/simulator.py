from fastapi import APIRouter, Depends, BackgroundTasks
from typing import List

from ..services.attack_simulator import attack_simulator
from ..routers.logs import create_log
from ..models.schemas import LogModel
from ..database import get_db

router = APIRouter(prefix="/api/simulator", tags=["Simulator"])

@router.get("/scenarios")
async def get_scenarios():
    return attack_simulator.get_scenarios()

@router.post("/run/{scenario_id}")
async def run_scenario(scenario_id: str, background_tasks: BackgroundTasks, db=Depends(get_db)):
    # Generate logs
    logs = attack_simulator.simulate_attack(scenario_id)
    
    saved_logs = []
    # Ingest logs into the system
    for log_data in logs:
        log_model = LogModel(**log_data)
        # Using the existing create_log method logic to ensure rules engine triggers
        saved = await create_log(log_model, background_tasks, db)
        saved_logs.append(saved)
        
    return {"status": "success", "message": f"Simulated {len(logs)} logs", "logs": saved_logs}

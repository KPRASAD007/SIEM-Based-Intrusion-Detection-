from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime

class LogModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_id: str
    process_name: Optional[str] = None
    user: Optional[str] = None
    ip_address: Optional[str] = None
    event_type: str
    severity: str = "low"
    raw_data: str # json string
    details: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        allow_population_by_field_name = True

class RuleModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    name: str
    description: str
    field: str
    operator: str # contains, equals, regex
    value: str
    severity: str # low, medium, high, critical
    mitre_attack_id: str
    is_active: bool = True
    
    class Config:
        allow_population_by_field_name = True

class AlertModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    rule_id: Optional[str] = None
    rule_name: str
    severity: str
    mitre_attack_id: str
    affected_host: Optional[str] = None
    source_ip: Optional[str] = None
    triggered_time: datetime = Field(default_factory=datetime.utcnow)
    matching_logs: int = 1
    status: str = "new" # new, investigating, resolved, false_positive
    log_ids: List[str] = Field(default_factory=list)
    threat_intel: Optional[Dict[str, Any]] = None # enrichment

    class Config:
        allow_population_by_field_name = True

class IncidentModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    case_id: str
    title: str
    status: str = "open" # open, in_progress, closed
    analyst_assigned: Optional[str] = None
    severity: str
    alerts_linked: List[str] = Field(default_factory=list)
    notes: List[Dict[str, Any]] = Field(default_factory=list) # {timestamp, author, content}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime, timezone

class LogModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(alias="_id", default=None)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    event_id: str
    process_name: Optional[str] = None
    user: Optional[str] = None
    ip_address: Optional[str] = None
    event_type: str = "sysmon"
    severity: str = "low"
    raw_data: str = ""
    details: Dict[str, Any] = Field(default_factory=dict)

class RuleModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(alias="_id", default=None)
    name: str
    description: str
    field: str
    operator: str # contains, equals, regex
    value: str
    severity: str # low, medium, high, critical
    mitre_attack_id: str
    is_active: bool = True

class AlertModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(alias="_id", default=None)
    rule_id: Optional[str] = None
    rule_name: str
    severity: str
    mitre_attack_id: str
    affected_host: Optional[str] = None
    source_ip: Optional[str] = None
    triggered_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    matching_logs: int = 1
    status: str = "new" # new, investigating, resolved, false_positive
    log_ids: List[str] = Field(default_factory=list)
    threat_intel: Optional[Dict[str, Any]] = None # enrichment
    detection_layer: Optional[str] = "HOST" # IDS, SIEM, DPI, HOST, NETWORK

class IncidentModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(alias="_id", default=None)
    case_id: str
    title: str
    status: str = "open" # open, in_progress, closed
    analyst_assigned: Optional[str] = None
    severity: str
    alerts_linked: List[str] = Field(default_factory=list)
    notes: List[Dict[str, Any]] = Field(default_factory=list) # {timestamp, author, content}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OracleRequest(BaseModel):
    message: str

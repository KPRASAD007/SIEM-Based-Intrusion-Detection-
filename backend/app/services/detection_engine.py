from typing import List, Dict, Any
from datetime import datetime
from ..models.schemas import RuleModel

class DetectionEngine:
    def __init__(self):
        # Sliding window for brute force: { "ip_user": [(timestamp, log_data), ...] }
        self.failed_logins = {}

    async def evaluate_log(self, log: Dict[str, Any], rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Evaluate a single log against a list of active rules.
        Returns a list of matching rules.
        """
        matched_rules = []
        
        # --- STATEFUL DETECTIONS ---
        if str(log.get("event_id")) == "4625":
            now = datetime.utcnow().timestamp()
            # Try to get IP, or fall back to Hostname as the sliding window key
            source = log.get("ip_address") or log.get("details", {}).get("host") or "unknown_source"
            
            if source not in self.failed_logins:
                self.failed_logins[source] = []
                
            # Add current failure
            self.failed_logins[source].append(now)
            
            # Keep only last 60 seconds
            self.failed_logins[source] = [t for t in self.failed_logins[source] if now - t <= 60]
            
            # Exactly 5 failures? Trigger Alert! (We cap it at 5 so it doesn't spam alerts for every 6th, 7th fail in the window)
            if len(self.failed_logins[source]) == 5:
                matched_rules.append({
                    "_id": "virtual_brute_force",
                    "name": "SIEM: Windows RDP/Local Brute Force",
                    "description": "5+ failed logon attempts (Event 4625) within 60 seconds.",
                    "severity": "high",
                    "mitre_attack_id": "T1110.001",
                    "is_active": True
                })

        for rule in rules:

            if self._check_condition(log, rule):
                matched_rules.append(rule)
        
        return matched_rules

    def _check_condition(self, log: Dict[str, Any], rule: Dict[str, Any]) -> bool:
        field = rule.get("field")
        operator = rule.get("operator")
        expected_value = rule.get("value")
        
        # Extract value from log (either top-level or inside details)
        log_value = log.get(field)
        if log_value is None:
            details = log.get("details", {})
            if isinstance(details, str):
                import json
                try:
                    details = json.loads(details)
                except:
                    details = {}
            log_value = details.get(field)
            
        if log_value is None:
            return False

        print(f"DEBUG_MATCH: field='{field}' log_val='{log_value}' expected='{expected_value}' op='{operator}'")
        log_value = str(log_value).lower()
        expected_value = str(expected_value).lower()

        if operator == "equals":
            return log_value == expected_value
        elif operator == "contains":
            return expected_value in log_value
        elif operator == "regex":
            import re
            try:
                pattern = re.compile(expected_value)
                return bool(pattern.search(log_value))
            except:
                return False
                
        return False
        
detection_engine = DetectionEngine()

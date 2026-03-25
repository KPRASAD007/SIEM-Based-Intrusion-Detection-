from typing import List, Dict, Any
from datetime import datetime
from ..models.schemas import RuleModel

class DetectionEngine:
    def __init__(self):
        pass

    async def evaluate_log(self, log: Dict[str, Any], rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Evaluate a single log against a list of active rules.
        Returns a list of matching rules.
        """
        matched_rules = []
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

from typing import Dict, Any, List
from datetime import datetime
import uuid
import random

class AttackSimulator:
    def __init__(self):
        pass

    def get_scenarios(self) -> List[Dict[str, str]]:
        return [
            {"id": "t1059", "name": "PowerShell Encoded Command", "mitre": "T1059.001"},
            {"id": "t1110", "name": "Brute Force Login Attack", "mitre": "T1110"},
            {"id": "t1134", "name": "Privilege Escalation via PsExec", "mitre": "T1134"},
            {"id": "t1047", "name": "Lateral Movement via WMI", "mitre": "T1047"},
            {"id": "t1003", "name": "Credential Dumping via Mimikatz", "mitre": "T1003"},
            {"id": "t1547", "name": "Persistence via Registry Run Keys", "mitre": "T1547"},
            {"id": "t1053", "name": "Scheduled Task Persistence", "mitre": "T1053"},
            {"id": "t1562", "name": "Defense Evasion by Disabling Defender", "mitre": "T1562"},
            {"id": "t1071", "name": "Suspicious DNS Beaconing", "mitre": "T1071"},
            {"id": "t1046", "name": "Network Scanning Activity", "mitre": "T1046"},
            {"id": "t1105", "name": "Suspicious File Download via Certutil", "mitre": "T1105"},
            {"id": "t1041", "name": "Data Exfiltration Simulation", "mitre": "T1041"},
            {"id": "t1486", "name": "Ransomware File Encryption Behavior", "mitre": "T1486"},
            {"id": "ssh_brute_force", "name": "SSH Brute Force Attack", "mitre": "T1110.001"},
            {"id": "suricata_scan", "name": "Advanced Network Recon (Suricata DPI)", "mitre": "T1046"},
            {"id": "ssh_dpi_anomaly", "name": "SSH Protocol DPI Anomaly", "mitre": "T1110"},
        ]

    def _generate_base_log(self) -> Dict[str, Any]:
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "sysmon",
            "severity": "high",
            "raw_data": "",
        }

    def simulate_attack(self, scenario_id: str) -> List[Dict[str, Any]]:
        logs = []
        base_log = self._generate_base_log()
        
        if scenario_id == "t1059":
            base_log.update({
                "event_id": "1",
                "process_name": "powershell.exe",
                "user": "NT AUTHORITY\\SYSTEM",
                "ip_address": "127.0.0.1",
                "details": {
                    "command_line": "powershell.exe -nop -w hidden -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAAgAEkATwAuAE0AZQBtAG8AcgB5AFMAdAByAGUAYQBtACgAWwBDAG8AbgB2AGUAcgB0AF0AOgA6AEYAcgBvAG0AQgBhAHMAZQA2ADQAUwB0AHIAaQBuAGcAKAAiAEgA...",
                    "parent_process": "cmd.exe"
                }
            })
            logs.append(base_log)
        elif scenario_id == "t1110":
            for _ in range(5):
                log = self._generate_base_log()
                log.update({
                    "event_id": "4625",
                    "event_type": "security",
                    "process_name": "winlogon.exe",
                    "user": "admin",
                    "ip_address": "192.168.1.100",
                    "details": {
                        "logon_type": 3,
                        "status": "0xc000006d"
                    }
                })
                logs.append(log)
        elif scenario_id == "t1003":
             base_log.update({
                "event_id": "10",
                "process_name": "lsass.exe",
                "user": "NT AUTHORITY\\SYSTEM",
                "details": {
                    "target_image": "C:\\Windows\\system32\\lsass.exe",
                    "granted_access": "0x1fffff",
                    "call_trace": "C:\\Windows\\SYSTEM32\\ntdll.dll"
                }
            })
             logs.append(base_log)
        # ... other scenarios ...
        elif scenario_id == "t1046":
             base_log.update({
                "event_id": "3",
                "process_name": "nmap.exe",
                "user": "WIN-PC\\User",
                "details": {
                    "destination_ip": "192.168.1.0/24",
                    "destination_port": "445",
                    "protocol": "tcp"
                }
            })
             logs.append(base_log)
        elif scenario_id == "suricata_scan":
             attacker_ip = f"192.168.1.{random.randint(2, 254)}"
             # Suricata EVE.json style log for Network Recon
             log = self._generate_base_log()
             log.update({
                 "event_id": "IDS-ALRT-01",
                 "event_type": "suricata",
                 "severity": "critical",
                 "ip_address": attacker_ip,
                 "details": {
                     "alert": {
                         "action": "allowed",
                         "signature_id": 2010935,
                         "signature": "ET SCAN Suspicious inbound to MSSQL port 1433",
                         "category": "Potentially Bad Traffic",
                         "severity": 1
                     },
                     "proto": "TCP",
                     "dest_port": 1433,
                     "src_port": random.randint(1024, 65535)
                 }
             })
             logs.append(log)
             
             # Sequential Scanning Logs
             for port in [3306, 5432, 27017, 6379]:
                 scan_log = self._generate_base_log()
                 scan_log.update({
                     "event_id": "IDS-FLOW-01",
                     "event_type": "suricata_flow",
                     "severity": "medium",
                     "ip_address": attacker_ip,
                     "details": {
                         "proto": "TCP",
                         "dest_port": port,
                         "flow_id": random.randint(100000, 999999),
                         "app_proto": "failed"
                     }
                 })
                 logs.append(scan_log)

        elif scenario_id == "ssh_dpi_anomaly":
             attacker_ip = "185.220.101.14" # Tor Exit Node Example
             # Suricata DPI Protocol Anomaly
             log = self._generate_base_log()
             log.update({
                 "event_id": "IDS-ALRT-02",
                 "event_type": "suricata",
                 "severity": "critical",
                 "ip_address": attacker_ip,
                 "details": {
                     "alert": {
                         "signature": "SURICATA SSH invalid banner",
                         "signature_id": 2200076,
                         "category": "Generic Protocol Command Decode",
                         "metadata": "DPI_FAIL, HANDSHAKE_ERR"
                     },
                     "proto": "TCP",
                     "app_proto": "ssh",
                     "dest_port": 22
                 }
             })
             logs.append(log)

        elif scenario_id == "ssh_brute_force":
            attacker_ip = "45.132.89.201"
            targets = ["production-server-01", "api-gateway-us-east", "db-cluster-node-3"]
            
            # LAYERED DEFENSE MAPPING
            # 1. Network Alert (Suricata) - Scanned first
            scan_log = self._generate_base_log()
            scan_log.update({
                "event_id": "IDS-ALRT-03",
                "event_type": "suricata",
                "severity": "medium",
                "ip_address": attacker_ip,
                "details": {
                    "alert": {
                        "signature": "ET SCAN libssh based SSH stress tool (Hydra/Medusa)",
                        "signature_id": 2012120
                    }
                }
            })
            logs.append(scan_log)

            # 2. Host Alert (Wazuh/Syslog) - Failed Logins
            for _ in range(8):
                host = random.choice(targets)
                log = self._generate_base_log()
                log.update({
                    "event_id": "4625",
                    "event_type": "ssh_auth_failure",
                    "process_name": "sshd",
                    "user": random.choice(["root", "admin", "ubuntu", "user"]),
                    "ip_address": attacker_ip,
                    "severity": "medium",
                    "details": {
                        "message": f"Failed SSH Login: Invalid password for user {random.choice(['root','admin'])} from {attacker_ip}",
                        "host": host,
                        "port": 22
                    }
                })
                logs.append(log)
            # ... Rest of success log handled below ...
        
        # Fallback and other scenarios...
        if not logs:
            if scenario_id == "ssh_brute_force":
                 # Success Log for SSH
                 success_log = self._generate_base_log()
                 success_log.update({
                    "event_id": "4624",
                    "event_type": "ssh_auth_success",
                    "process_name": "sshd",
                    "user": "root",
                    "ip_address": attacker_ip,
                    "severity": "critical",
                    "details": {
                        "message": f"SSH Login: Accepted password for root from {attacker_ip} port 22 ssh2",
                        "host": "production-server-01",
                        "port": 22
                    }
                })
                 logs.append(success_log)
            else:
                 # Default generic log for IDs not specifically handled above
                 for s in self.get_scenarios():
                     if s["id"] == scenario_id:
                         base_log.update({
                            "event_type": "generic_simulation",
                            "process_name": s["name"],
                            "details": {"mitre": s["mitre"]}
                         })
                         logs.append(base_log)
                         break
        
        # Add stringified raw data for frontend viewing
        import json
        for log in logs:
            log["raw_data"] = json.dumps(log)
            
        return logs

attack_simulator = AttackSimulator()

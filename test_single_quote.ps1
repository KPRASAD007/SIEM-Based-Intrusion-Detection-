$Code = @'
$Endpoint = "https://siem-based-intrusion-detection.vercel.app/api/logs"
$ApiKey = "CYBER-DETECT-DEFAULT-KEY"
Write-Host "[+] Target SIEM: $Endpoint" -ForegroundColor Cyan
$Hostname = $env:COMPUTERNAME
while ($true) {
    Start-Sleep -Seconds 3
    $procs = Get-Process | Sort-Object CPU -Descending | Select-Object -First 1
    $procName = $procs.Name + ".exe"
    $Payload = @{
        event_id = "HEARTBEAT-001"
        process_name = $procName
        severity = "low"
        ip_address = "127.0.0.1"
        details = @{ host = $Hostname; source = "Remote Windows Forwarder" }
    }
    $JsonPayload = $Payload | ConvertTo-Json -Depth 5 -Compress
    $headers = @{ "X-API-Key" = $ApiKey }
    try {
        Invoke-RestMethod -Uri $Endpoint -Method Post -Body $JsonPayload -ContentType "application/json" -Headers $headers -TimeoutSec 5 | Out-Null
        Write-Host "[*] Heartbeat sent: $procName" -ForegroundColor DarkGray
    } catch {
        Write-Host "[!] Connection failed: $_" -ForegroundColor Red
    }
}
'@
$Code | Out-File "$env:TEMP\agent_test.ps1"
powershell.exe -ExecutionPolicy Bypass -File "$env:TEMP\agent_test.ps1"

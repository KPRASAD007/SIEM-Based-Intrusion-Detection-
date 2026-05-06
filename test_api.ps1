$ServerIP = "siem-based-intrusion-detection.vercel.app"
$Protocol = "https"
$Endpoint = "${Protocol}://${ServerIP}:443/api/logs"
Write-Host "Endpoint: $Endpoint"
$ApiKey = "CYBER-DETECT-DEFAULT-KEY"
$Payload = @{
    event_id = "HEARTBEAT-001"
    process_name = "system"
    severity = "low"
    ip_address = "127.0.0.1"
    details = @{ host = "n1khil"; source = "Remote Windows Forwarder" }
}
$JsonPayload = $Payload | ConvertTo-Json -Depth 5 -Compress
$headers = @{ "X-API-Key" = $ApiKey }
Invoke-RestMethod -Uri $Endpoint -Method Post -Body $JsonPayload -ContentType "application/json" -Headers $headers -TimeoutSec 5

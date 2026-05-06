$Code = (iwr -useb "https://siem-based-intrusion-detection.vercel.app/api/download/agent").Content
$Code = $Code.Replace('http://${s}:8080', 'https://${s}').Replace('-ContentType "application/json"', '-ContentType "application/json" -Headers @{"X-API-Key"="CYBER-DETECT-DEFAULT-KEY"}')
$env:SIEM_IP="siem-based-intrusion-detection.vercel.app"
Write-Host "Length of code:" $Code.Length
$Code | Out-File .\test_agent_script.ps1

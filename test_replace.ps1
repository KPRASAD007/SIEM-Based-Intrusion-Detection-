$script = (iwr -useb "https://siem-based-intrusion-detection.vercel.app/api/download/agent").Content
$script = $script.Replace('http://${s}:8080', 'https://${s}').Replace('-ContentType "application/json"', '-ContentType "application/json" -Headers @{"X-API-Key"="CYBER-DETECT-DEFAULT-KEY"}')
$env:SIEM_IP="siem-based-intrusion-detection.vercel.app"
Write-Host "Replaced script snippet:"
$script -match "Invoke-RestMethod" | Out-Null
$script.Substring($script.IndexOf("Invoke-RestMethod"), 150)

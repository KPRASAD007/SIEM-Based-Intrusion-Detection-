$Code = @'
$ServerIP = "siem-based-intrusion-detection.vercel.app"
$Endpoint = "https://${ServerIP}/api/logs"

Write-Host "[+] Target SIEM: $ServerIP"

try {
    Invoke-RestMethod `
        -Uri $Endpoint `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{"X-API-Key"="CYBER-DETECT-DEFAULT-KEY"} `
        -Body '{"test":"hello"}'

    Write-Host "[+] Connection OK"
}
catch {
    Write-Host "[!] Connection failed: $($_.Exception.Message)"
}
'@

$Code | Out-File "$env:TEMP\agent.ps1" -Encoding utf8

powershell.exe -ExecutionPolicy Bypass -File "$env:TEMP\agent.ps1"

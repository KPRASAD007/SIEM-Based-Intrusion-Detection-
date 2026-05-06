$path = "$env:TEMP\agent.ps1"
iwr -useb "https://siem-based-intrusion-detection.vercel.app/api/download/agent" -OutFile $path
$content = [System.IO.File]::ReadAllText($path)
$content = $content.Replace('http://${s}:8080', 'https://${s}')
$content = $content.Replace('-ContentType "application/json"', '-ContentType "application/json" -Headers @{"X-API-Key"="CYBER-DETECT-DEFAULT-KEY"}')
[System.IO.File]::WriteAllText($path, $content)
Write-Host "Replaced content sample:"
$content.Substring($content.IndexOf("Invoke-RestMethod -Uri `$siemUrl"), 160)

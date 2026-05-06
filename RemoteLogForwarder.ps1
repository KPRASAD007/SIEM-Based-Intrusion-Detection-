<#
.SYNOPSIS
    CyberDetect Resilience Agent v3.0
.DESCRIPTION
    Real-time telemetry agent with local persistence, encrypted transmission ready, 
    and authenticated ingestion headers.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory=$false)]
    [string]$ServerIP,
    [Parameter(Mandatory=$false)]
    [int]$Port = 8080,
    [Parameter(Mandatory=$false)]
    [string]$ApiKey = "CYBER-DETECT-DEFAULT-KEY", # Matches the backend default
    [Parameter(Mandatory=$false)]
    [int]$PollIntervalSeconds = 5,
    [Parameter(Mandatory=$false)]
    [switch]$Continuous
)

# Use inherited server variable if available
if (-not $ServerIP -and (Test-Path Variable:s)) { $ServerIP = $s }
if (-not $ServerIP -and (Test-Path Variable:h)) { $ServerIP = $h }
if (-not $ServerIP) { $ServerIP = "127.0.0.1" } 

$Protocol = "http" # Set to 'https' if TLS is configured on the backend
$Endpoint = "${Protocol}://${ServerIP}:${Port}/api/logs"
$Hostname = $env:COMPUTERNAME
$CacheFile = "$env:TEMP\siem_backlog.json"

function Write-Log {
    param([string]$Message, [ConsoleColor]$Color = "White")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$Timestamp] $Message" -ForegroundColor $Color
}

function Save-To-Cache {
    param($Payload)
    $Existing = @()
    if (Test-Path $CacheFile) {
        $Existing = Get-Content $CacheFile | ConvertFrom-Json
    }
    $Existing += $Payload
    $Existing | ConvertTo-Json -Depth 5 | Out-File $CacheFile
    Write-Log "[!] SIEM Offline. Log cached locally: $($Payload.event_id)" "Yellow"
}

function Flush-Cache {
    if (-not (Test-Path $CacheFile)) { return }
    $Backlog = Get-Content $CacheFile | ConvertFrom-Json
    if ($Backlog.Count -eq 0) { return }
    
    Write-Log "[*] Attempting to flush backlog of $($Backlog.Count) events..." "Cyan"
    $Remaining = @()
    
    foreach ($item in $Backlog) {
        try {
            $Json = $item | ConvertTo-Json -Depth 5 -Compress
            $headers = @{ "X-API-Key" = $ApiKey }
            Invoke-RestMethod -Uri $Endpoint -Method Post -Body $Json -ContentType "application/json" -Headers $headers -TimeoutSec 3
            Write-Log "[+] Flushed event: $($item.event_id)" "Green"
        } catch {
            $Remaining += $item
        }
    }
    
    if ($Remaining.Count -gt 0) {
        $Remaining | ConvertTo-Json -Depth 5 | Out-File $CacheFile
    } else {
        Remove-Item $CacheFile
    }
}

function Stream-Logs {
    param([DateTime]$StartTime)
    
    $StartTimeUtc = $StartTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    $FilterXml = @"
<QueryList>
  <Query Id="0" Path="Security">
    <Select Path="Security">*[System[TimeCreated[@SystemTime>='$StartTimeUtc'] and (EventID=4688 or EventID=4624 or EventID=4625)]]</Select>
  </Query>
</QueryList>
"@
    $Events = $null
    try { $Events = Get-WinEvent -FilterXml $FilterXml -ErrorAction SilentlyContinue } catch {}
    if (-not $Events) { return $StartTime }
    
    $LatestEventTime = $StartTime
    foreach ($Event in $Events) {
        if ($Event.TimeCreated -gt $LatestEventTime) { $LatestEventTime = $Event.TimeCreated }

        $EventId = $Event.Id.ToString()
        $EventXml = [xml]$Event.ToXml()
        $ParsedData = @{}
        if ($EventXml.Event.EventData.Data) {
            foreach ($Node in $EventXml.Event.EventData.Data) { $ParsedData[$Node.Name] = $Node.InnerText }
        }
        
        $Payload = @{
            event_id = $EventId
            process_name = if ($EventId -eq "4688") { $ParsedData["NewProcessName"] -replace '.*\\', '' } else { "System" }
            user = if ($EventId -eq "4624" -or $EventId -eq "4625") { $ParsedData["TargetUserName"] } else { $ParsedData["SubjectUserName"] }
            ip_address = if ($ParsedData["IpAddress"] -and $ParsedData["IpAddress"] -ne "-") { $ParsedData["IpAddress"] } else { $Hostname }
            command_line = if ($EventId -eq "4688") { $ParsedData["CommandLine"] } else { "" }
            event_type = if ($EventId -eq "4688") { "Process Execution" } elseif ($EventId -eq "4624") { "Successful Logon" } elseif ($EventId -eq "4625") { "Failed Logon" } else { "Logon" }
            severity = "low"
            timestamp = $Event.TimeCreated.ToString("yyyy-MM-ddTHH:mm:ssZ")
            details = @{ host = $Hostname; source = "Resilience Agent v3"; parsed_context = $ParsedData }
        }

        $JsonPayload = $Payload | ConvertTo-Json -Depth 5 -Compress
        $headers = @{ "X-API-Key" = $ApiKey }

        try {
            Invoke-RestMethod -Uri $Endpoint -Method Post -Body $JsonPayload -ContentType "application/json" -Headers $headers -TimeoutSec 5
            Write-Log "[+] Shipped Event: $EventId" "Green"
        } catch {
            Save-To-Cache -Payload $Payload
        }
    }
    return $LatestEventTime
}

Write-Log "CyberDetect Resilience Agent v3.0 Initialized." "Cyan"
Write-Log "Ingestion Security: Authenticated (X-API-Key)" "Cyan"
Write-Log "Persistence Layer: Enabled ($CacheFile)" "Cyan"

$LastEventTime = Get-Date
if ($Continuous) {
    while ($true) {
        Flush-Cache
        $LastEventTime = Stream-Logs -StartTime $LastEventTime
        Start-Sleep -Seconds $PollIntervalSeconds
    }
} else {
    $LastEventTime = Stream-Logs -StartTime (Get-Date).AddHours(-1)
    Flush-Cache
}

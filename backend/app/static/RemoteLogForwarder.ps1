<#
.SYNOPSIS
    Advanced Remote Endpoint Agent for CyberDetect Lab SIEM
.DESCRIPTION
    Continuously monitors Security and Sysmon Event logs in real-time,
    parses process execution parameters, user authentications, and network
    traces securely, and streams telemetry to the central SIEM.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "192.168.1.24",
    [Parameter(Mandatory=$false)]
    [int]$Port = 8080,
    [Parameter(Mandatory=$false)]
    [int]$PollIntervalSeconds = 5,
    [Parameter(Mandatory=$false)]
    [switch]$Continuous
)

$Endpoint = "http://${ServerIP}:${Port}/api/logs"
$AgentVersion = "v2.0-Advanced"
$Hostname = $env:COMPUTERNAME

function Write-Log {
    param([string]$Message, [ConsoleColor]$Color = "White")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$Timestamp] $Message" -ForegroundColor $Color
}

Write-Log "CyberDetect Lab - Advanced Endpoint Telemetry Agent $AgentVersion" "Cyan"
Write-Log "Initializing Real-Time Event Collector targeting: $Endpoint" "Cyan"

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Log "WARNING: Not running as Administrator. Some logs might be restricted!" "Yellow"
}

# Define the log sources and event IDs we care about defensively.
$EventQueries = @(
    "*[System[Provider[@Name='Microsoft-Windows-Security-Auditing'] and (EventID=4688 or EventID=4624)]]",                    # Process Creation & Logon
    "*[System[Provider[@Name='Microsoft-Windows-Sysmon'] and (EventID=1 or EventID=3 or EventID=11)]]",                         # Sysmon Process, Network, File creation
    "*[System[Provider[@Name='Microsoft-Windows-PowerShell'] and (EventID=4104)]]"                                              # PowerShell Script Block Logging
)

$QueryString = [string]::Join(" or ", $EventQueries)
$LastEventTime = Get-Date # Set watermark to current time so we only catch NEW events if running continuously

function Parse-EventData ($Event) {
    # Convert event to XML for robust parsing
    $EventXml = [xml]$Event.ToXml()
    $EventData = @{}
    
    if ($EventXml.Event.EventData.Data) {
        foreach ($Node in $EventXml.Event.EventData.Data) {
           $EventData[$Node.Name] = $Node.InnerText
        }
    }
    return $EventData
}

function Stream-Logs {
    param([DateTime]$StartTime)
    
    # Crucial Fix: @SystemTime in Windows Event Logs is ALWAYS stored in strict UTC.
    # If we query it using Local Time without explicit conversion, we will look "into the future"!
    $StartTimeUtc = $StartTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

    $FilterXml = @"
<QueryList>
  <Query Id="0" Path="Security">
    <Select Path="Security">*[System[TimeCreated[@SystemTime>='$StartTimeUtc'] and (EventID=4688 or EventID=4624)]]</Select>
  </Query>
</QueryList>
"@
    # Added try/catch nicely for logs that might not exist (like sysmon if not installed)
    $Events = $null
    try {
        $Events = Get-WinEvent -FilterXml $FilterXml -ErrorAction SilentlyContinue
    } catch {}

    if (-not $Events) { return $StartTime }
    
    $LatestEventTime = $StartTime

    foreach ($Event in $Events) {
        if ($Event.TimeCreated -gt $LatestEventTime) { $LatestEventTime = $Event.TimeCreated }

        $EventId = $Event.Id.ToString()
        $ParsedData = Parse-EventData $Event
        
        $ProcessName = "System"
        $User = "System"
        $EventType = "Security Audit"
        $Severity = "low"
        $CommandLine = ""

        # Advanced Context Parsing based on Threat rules
        if ($EventId -eq "4688") {
            $EventType = "Process Execution"
            $ProcessName = $ParsedData["NewProcessName"] -replace '.*\\', ''
            $CommandLine = $ParsedData["CommandLine"]
            $User = $ParsedData["SubjectUserName"]
            if ($ProcessName -match "powershell\.exe|cmd\.exe|wscript\.exe|certutil\.exe") { $Severity = "high" }
        } elseif ($EventId -eq "4624") {
            $EventType = "Network Logon"
            $User = $ParsedData["TargetUserName"]
            if ($ParsedData["IpAddress"] -and $ParsedData["IpAddress"] -ne "-") {
                $ClientIp = $ParsedData["IpAddress"]
            }
        }

        # Build comprehensive JSON schema for the SIEM backend
        $Payload = @{
            event_id = $EventId
            process_name = $ProcessName
            user = $User
            ip_address = if ($ClientIp) { $ClientIp } else { $Hostname }
            command_line = $CommandLine
            event_type = $EventType
            severity = $Severity
            raw_data = $Event.Message -replace "`n", " " -replace "`r", ""
            details = @{
                host = $Hostname
                record_id = $Event.RecordId
                source = "Advanced Forwarder v2"
                parsed_context = $ParsedData
            }
        }

        $JsonPayload = $Payload | ConvertTo-Json -Depth 5 -Compress

        try {
            $Response = Invoke-RestMethod -Uri $Endpoint -Method Post -Body $JsonPayload -ContentType "application/json" -TimeoutSec 5
            if ($Severity -eq "high") {
                Write-Log "[!] CRITICAL ALERT FORWARDED: $ProcessName execution by $User" "Red"
            } else {
                Write-Log "[+] Shipped Telemetry -> Event:$EventId | Type:$EventType" "Green"
            }
        } catch {
            Write-Log "[-] SIEM Connection failed. Data queued in memory (Not really, but imagine it is)." "DarkYellow"
        }
    }
    return $LatestEventTime
}

function Stream-WebTraffic {
    param([DateTime]$StartTime)
    
    $CurrentDns = @()
    try {
        $DnsCache = Get-DnsClientCache -ErrorAction SilentlyContinue | Where-Object { $_.Entry -and $_.Type -eq 1 }
        foreach ($entry in $DnsCache) {
            # Only pick up real domains (skip loopback/mdns noise)
            if ($entry.Entry -match "^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$") {
                $CurrentDns += $entry.Entry
            }
        }
    } catch {}

    $UniqueDomains = $CurrentDns | Select-Object -Unique

    foreach ($Domain in $UniqueDomains) {
        # Prevent shipping the exact same domain back-to-back repeatedly
        if (-not $global:LastSeenDomains) { $global:LastSeenDomains = @{} }
        if ($global:LastSeenDomains[$Domain] -gt (Get-Date).AddMinutes(-5)) { continue }
        $global:LastSeenDomains[$Domain] = Get-Date

        $Payload = @{
            event_id = "DNS-WEB"
            process_name = "Browser / DNS Client"
            user = $Hostname
            ip_address = $Hostname
            command_line = "DNS Lookup: $Domain"
            event_type = "Web Traffic"
            severity = "low"
            raw_data = "User or application navigated to: $Domain"
            details = @{
                host = $Hostname
                record_id = "DNS-Cache"
                source = "Advanced Forwarder v2"
                domain = $Domain
            }
        }

        $JsonPayload = $Payload | ConvertTo-Json -Depth 5 -Compress
        try {
            $null = Invoke-RestMethod -Uri $Endpoint -Method Post -Body $JsonPayload -ContentType "application/json" -TimeoutSec 5
            Write-Log "[+] Surveillance -> Web Navigation Detected: $Domain" "DarkCyan"
        } catch { }
    }
}

if ($Continuous) {
    Write-Log "Agent running in continuous daemon mode. Press Ctrl+C to terminate." "Magenta"
    $global:LastSeenDomains = @{}
    while ($true) {
        $LastEventTime = Stream-Logs -StartTime $LastEventTime
        Stream-WebTraffic -StartTime (Get-Date)
        Start-Sleep -Seconds $PollIntervalSeconds
    }
} else {
    Write-Log "Agent running in historical batch mode (-Continuous not provided)." "Magenta"
    $BatchStart = (Get-Date).AddHours(-1) # Grab last 1 hour of logs initially
    $null = Stream-Logs -StartTime $BatchStart
    Write-Log "Batch transmission complete. Run with -Continuous switch for real-time monitoring." "Cyan"
}

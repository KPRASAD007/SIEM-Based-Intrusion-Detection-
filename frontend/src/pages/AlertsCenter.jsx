import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock, X, AlertTriangle, Activity, Lock, Search, Filter, Globe, Database, ShieldCheck, ShieldX, Zap, RefreshCw } from 'lucide-react';

export default function AlertsCenter() {
  const [allAlerts, setAllAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('active');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [investigatingAlert, setInvestigatingAlert] = useState(null);
  const [intelData, setIntelData] = useState(null);
  const [fetchingIntel, setFetchingIntel] = useState(false);
  const [intelError, setIntelError] = useState(null);
  const [soarRunning, setSoarRunning] = useState({}); // {actionName: true/false}
  const [soarSuccess, setSoarSuccess] = useState({}); // {actionName: msg}
  const [soarError, setSoarError] = useState(null);

  const fetchAlerts = () => {
    setLoading(true);
    fetch(`http://${window.location.hostname}:8080/api/alerts`)
      .then(res => res.json())
      .then(data => {
        setAllAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching alerts:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();

    // Real-time alert updates
    const ws = new WebSocket(`ws://${window.location.hostname}:8080/api/logs/ws`);
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'NEW_ALERT') {
          setAllAlerts(prev => [payload.data, ...prev]);
        }
      } catch (e) {
        console.error("WS error in AlertsCenter:", e);
      }
    };
    return () => ws.close();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/alerts/${id}/status?status=${newStatus}`, {
        method: 'PUT'
      });
      if (res.ok) {
        setAllAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        if (investigatingAlert?.id === id) setInvestigatingAlert(null);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const startInvestigation = (alert) => {
    setInvestigatingAlert(alert);
    setIntelData(null); // Reset intel when opening new investigation
  };

  const fetchThreatIntel = async (ip) => {
    if (!ip || ip === 'N/A' || ip === 'Unknown') {
      setIntelError("No valid IP address found for enrichment.");
      return;
    }
    setFetchingIntel(true);
    setIntelError(null);
    setIntelData(null);
    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/intel/lookup/${encodeURIComponent(ip)}`);
      if (res.ok) {
        const data = await res.json();
        setIntelData(data);
      } else {
        setIntelError(`Failed to fetch intelligence: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error("TI lookup failed", err);
      setIntelError("Could not connect to Threat Intelligence service.");
    }
    setFetchingIntel(false);
  };

  const triggerSoarAction = async (action, target) => {
    if (!target || target === 'N/A' || target === 'Unknown') {
      setSoarError(`Invalid target for ${action}: No valid identifier found.`);
      return;
    }
    setSoarRunning(prev => ({ ...prev, [action]: true }));
    setSoarSuccess(prev => ({ ...prev, [action]: null }));
    setSoarError(null);
    
    try {
      const endpoint = action === 'quarantine' ? `quarantine/${encodeURIComponent(target)}` : `ban-ip/${encodeURIComponent(target)}`;
      const res = await fetch(`http://${window.location.hostname}:8080/api/soar/${endpoint}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setSoarSuccess(prev => ({ ...prev, [action]: data.message }));
      } else {
        const errData = await res.json().catch(() => ({ detail: 'Unknown error' }));
        setSoarError(`SOAR Execution Failed: ${errData.detail || res.statusText}`);
      }
    } catch (err) {
      console.error("SOAR action failed", err);
      setSoarError("Failed to connect to SOAR orchestration service.");
    }
    setSoarRunning(prev => ({ ...prev, [action]: false }));
  };

  const filteredAlerts = allAlerts.filter(a => {
    let sMatch = true;
    if (statusFilter === 'active') { sMatch = ['new', 'investigating'].includes(a.status); }
    else if (statusFilter !== 'all') { sMatch = a.status === statusFilter; }
    
    let sevMatch = true;
    if (severityFilter !== 'all') { sevMatch = a.severity?.toLowerCase() === severityFilter; }
    
    return sMatch && sevMatch;
  });

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const dateStr = timeStr.endsWith('Z') || timeStr.includes('+') ? timeStr : timeStr.replace(' ', 'T') + 'Z';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soc-text">Alerts Center</h2>
          <p className="text-sm text-soc-muted mt-1">Review and triage security detections</p>
        </div>
        <button onClick={fetchAlerts} className="flex items-center px-4 py-2 bg-soc-panel border border-soc-border rounded hover:border-soc-primary hover:text-soc-primary transition-colors text-sm">
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Alerts
        </button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 bg-soc-panel p-4 rounded-lg border border-soc-border shadow-lg">
        <div className="flex items-center">
            <Filter size={18} className="text-soc-muted mr-3" />
            <span className="text-soc-text font-medium text-sm">Filters:</span>
        </div>
        <div>
          <select 
            className="bg-soc-bg border border-soc-border rounded px-3 py-1.5 text-sm text-soc-text w-full sm:w-auto outline-none transition-colors hover:border-soc-primary focus:border-soc-primary cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (New / Investigating)</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positives</option>
          </select>
        </div>
        <div>
          <select 
            className="bg-soc-bg border border-soc-border rounded px-3 py-1.5 text-sm text-soc-text w-full sm:w-auto outline-none transition-colors hover:border-soc-primary focus:border-soc-primary cursor-pointer"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">Any Severity</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-soc-muted text-center py-8">Loading alerts...</div>
        ) : filteredAlerts.length === 0 ? (
           <div className="text-soc-muted text-center py-8 bg-soc-panel border border-soc-border rounded-lg shadow-lg">No alerts match the current filters.</div>
        ) : (
          filteredAlerts.map(alert => (
            <div key={alert.id} className="bg-soc-panel border-l-4 border border-soc-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between shadow-lg hover:bg-soc-bg/40 transition-colors"
                 style={{ borderLeftColor: alert.severity === 'critical' ? '#991B1B' : alert.severity === 'high' ? '#EF4444' : '#F59E0B' }}>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold bg-soc-bg border
                    ${alert.severity === 'critical' ? 'text-soc-critical border-soc-critical/50' : 
                      alert.severity === 'high' ? 'text-soc-danger border-soc-danger/50' : 
                      'text-soc-warning border-soc-warning/50'}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-semibold text-soc-text">{alert.rule_name}</h3>
                </div>
                <div className="flex items-center space-x-6 text-sm text-soc-muted">
                  <span className="flex items-center"><Clock size={14} className="mr-1" /> {formatTime(alert.triggered_time)}</span>
                  <span><strong>MITRE:</strong> <span className="text-soc-primary hover:underline cursor-pointer">{alert.mitre_attack_id}</span></span>
                  {alert.source_ip && <span><strong>Source:</strong> <span className="font-mono">{alert.source_ip}</span></span>}
                  {alert.affected_host && <span><strong>Host:</strong> <span className="font-mono">{alert.affected_host}</span></span>}
                </div>
                {alert.threat_intel && (
                  <div className="mt-3 text-xs bg-soc-bg p-2 rounded border border-soc-border flex items-center space-x-4">
                    <span className="font-semibold text-soc-muted">Threat Intel:</span>
                    <span className={alert.threat_intel?.score > 50 ? 'text-soc-success' : 'text-soc-danger'}>
                      Status: {alert.threat_intel?.status || 'N/A'}
                    </span>
                    {alert.threat_intel?.score !== undefined && (
                        <span>Score: {alert.threat_intel.score}/100</span>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-2">
                <button 
                  onClick={() => startInvestigation(alert)}
                  className="px-3 py-1.5 bg-soc-bg border border-soc-border rounded hover:border-soc-primary text-sm transition-colors hover:text-soc-primary shadow-sm"
                >
                  <Search size={14} className="inline mr-1" /> Investigate
                </button>
                <button 
                  onClick={() => handleStatusChange(alert.id, 'resolved')}
                  className="px-3 py-1.5 bg-soc-success/10 text-soc-success border border-soc-success/30 rounded hover:bg-soc-success/20 text-sm transition-colors shadow-sm"
                >
                  <CheckCircle size={14} className="inline mr-1" /> Resolve
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Investigation Modal */}
      {investigatingAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-soc-panel border border-soc-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-soc-border bg-gradient-to-r from-soc-bg to-soc-panel">
              <div className="flex items-center space-x-3">
                <ShieldAlert className={investigatingAlert.severity === 'critical' ? 'text-soc-critical' : 'text-soc-danger'} size={28} />
                <div>
                  <h2 className="text-xl font-bold text-soc-text">Active Investigation playbook</h2>
                  <p className="text-sm text-soc-muted">{investigatingAlert.rule_name}</p>
                </div>
              </div>
              <button onClick={() => setInvestigatingAlert(null)} className="text-soc-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              {/* Context */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-soc-bg p-4 rounded-lg border border-soc-border">
                  <span className="text-xs text-soc-muted uppercase block mb-1">Severity</span>
                  <span className="font-bold text-soc-danger">{investigatingAlert.severity.toUpperCase()}</span>
                </div>
                <div className="bg-soc-bg p-4 rounded-lg border border-soc-border">
                  <span className="text-xs text-soc-muted uppercase block mb-1">Target Host</span>
                  <span className="font-mono text-soc-text">{investigatingAlert.affected_host || 'N/A'}</span>
                </div>
                <div className="bg-soc-bg p-4 rounded-lg border border-soc-border">
                  <span className="text-xs text-soc-muted uppercase block mb-1">Attacker IP</span>
                  <span className="font-mono text-blue-400">{investigatingAlert.source_ip || 'N/A'}</span>
                </div>
                <div className="bg-soc-bg p-4 rounded-lg border border-soc-border">
                  <span className="text-xs text-soc-muted uppercase block mb-1">MITRE ATT&CK</span>
                  <span className="font-bold text-soc-primary">{investigatingAlert.mitre_attack_id}</span>
                </div>
              </div>

              {/* Playbook Steps */}
              <div>
                <h3 className="text-lg font-bold text-soc-text mb-4 border-b border-soc-border pb-2">Analyst Playbook: Incident Containment</h3>
                <div className="space-y-4">
                  
                  <div className="flex items-start bg-soc-bg/50 p-4 rounded-lg border border-soc-border/50">
                    <div className="w-8 h-8 rounded-full bg-soc-primary/20 text-soc-primary flex items-center justify-center font-bold mr-4 shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold text-soc-text text-sm">Verify Threat Intelligence & Triage</h4>
                      <div className="flex flex-col space-y-3 mt-2">
                        <p className="text-xs text-soc-muted leading-relaxed">
                          Examine the origin of this alert. The associated IP is <span className="font-mono text-soc-text px-1 bg-black/30 rounded">{investigatingAlert.source_ip || 'Unknown'}</span>. 
                        </p>
                        
                        {!intelData ? (
                          <div className="space-y-2">
                            <button 
                              onClick={() => fetchThreatIntel(investigatingAlert.source_ip)}
                              disabled={fetchingIntel || !investigatingAlert.source_ip}
                              className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded text-xs font-bold border border-soc-primary/30 transition-all ${fetchingIntel ? 'bg-soc-primary/10 text-soc-primary animate-pulse' : 'bg-soc-primary/5 text-soc-primary hover:bg-soc-primary hover:text-white'}`}
                            >
                              <Database size={14} />
                              <span>{fetchingIntel ? 'QUERYING TI ENGINES...' : 'ENRICH WITH THREAT INTEL'}</span>
                            </button>
                            {intelError && (
                              <div className="text-[10px] text-soc-danger bg-soc-danger/10 p-2 rounded border border-soc-danger/20 flex items-center">
                                <AlertTriangle size={12} className="mr-2" />
                                {intelError}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-soc-bg border border-soc-border rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`p-1 rounded ${intelData.verdict === 'CRITICAL RISK' ? 'bg-soc-critical/20 text-soc-critical' : 'bg-soc-warning/20 text-soc-warning'}`}>
                                  {intelData.verdict === 'CRITICAL RISK' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider">{intelData.verdict}</span>
                              </div>
                              <span className="text-[10px] text-soc-muted uppercase">Reputation: {intelData.summary.reputation}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1">
                                  <label className="text-[9px] text-soc-muted uppercase flex items-center"><Globe size={10} className="mr-1" /> Origin</label>
                                  <p className="text-xs text-soc-text">{intelData.geodata.city}, {intelData.geodata.country}</p>
                                  <p className="text-[10px] text-soc-muted font-mono">{intelData.geodata.asn}</p>
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[9px] text-soc-muted uppercase flex items-center"><Activity size={10} className="mr-1" /> Analysis</label>
                                  <div className="flex space-x-2">
                                     <div className="flex flex-col">
                                        <span className="text-[10px] text-soc-muted">VT Hits</span>
                                        <span className="text-xs font-bold text-soc-danger">{intelData.threat_details.provider_hits.virustotal}/72</span>
                                     </div>
                                     <div className="flex flex-col border-l border-soc-border pl-2">
                                        <span className="text-[10px] text-soc-muted">Rep Score</span>
                                        <span className="text-xs font-bold text-soc-warning">{intelData.summary.score}%</span>
                                     </div>
                                  </div>
                               </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2 border-t border-soc-border/50">
                               {intelData.threat_details.tags.map(tag => (
                                 <span key={tag} className="px-2 py-0.5 bg-soc-panel text-[9px] rounded-full text-soc-muted border border-soc-border">#{tag}</span>
                               ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-soc-muted leading-relaxed">
                          Launch a query in the Log Explorer filtering by <code>ip_address:{investigatingAlert.source_ip}</code> to check for lateral movement.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-soc-bg/50 p-4 rounded-lg border border-soc-border/50">
                    <div className="w-8 h-8 rounded-full bg-soc-primary/20 text-soc-primary flex items-center justify-center font-bold mr-4 shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold text-soc-text text-sm">Targeted Analysis</h4>
                      <p className="text-xs text-soc-muted mt-1 leading-relaxed">
                        {investigatingAlert.rule_name?.toLowerCase().includes("ransomware") || investigatingAlert.rule_name?.toLowerCase().includes("vss") ? (
                           "RANSOMWARE PROTOCOL ACTIVE: Immediately review the affected host for encrypted files. Check if the process 'vssadmin.exe' successfully executed. If shadows are deleted, recovery relies strictly on offline backups."
                        ) : investigatingAlert.rule_name?.toLowerCase().includes("bypass uac") || investigatingAlert.rule_name?.toLowerCase().includes("privilege") ? (
                           "PRIVILEGE ESCALATION DETECTED: An adversary has likely bypassed User Account Control. Review the Sysmon process tree starting from the alert timestamp to find the high-integrity payload they dropped."
                        ) : investigatingAlert.rule_name?.toLowerCase().includes("credential") || investigatingAlert.rule_name?.toLowerCase().includes("lsass") ? (
                           "CREDENTIAL DUMPING DETECTED: The adversary is attempting to harvest credentials from memory. Assume the user accounts logged onto this specific host are fully compromised. Initiate immediate password resets."
                        ) : (
                           `Examine logs matching the MITRE technique ${investigatingAlert.mitre_attack_id}. Correlate the surrounding events within a 15-minute window.`
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start bg-soc-bg/50 p-4 rounded-lg border border-soc-border/50">
                    <div className="w-8 h-8 rounded-full bg-soc-danger/20 text-soc-danger flex items-center justify-center font-bold mr-4 shrink-0">3</div>
                    <div className="w-full">
                      <h4 className="font-semibold text-soc-text text-sm">Immediate Remediation Actions</h4>
                      <p className="text-xs text-soc-muted mt-1 mb-3">
                        If this execution is confirmed as a true positive attack by the Threat Actor, execute the following containment measures:
                      </p>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => triggerSoarAction('quarantine', investigatingAlert.affected_host)}
                          disabled={soarRunning['quarantine'] || soarSuccess['quarantine'] || !investigatingAlert.affected_host}
                          className={`text-xs px-3 py-1.5 border rounded flex items-center transition-all ${soarSuccess['quarantine'] ? 'bg-soc-success/20 text-soc-success border-soc-success' : 'bg-soc-danger/10 text-soc-danger border-soc-danger/30 hover:bg-soc-danger/20'}`}
                        >
                          {soarRunning['quarantine'] ? <><Activity size={12} className="mr-1 animate-spin" /> ISOLATING...</> : soarSuccess['quarantine'] ? <><CheckCircle size={12} className="mr-1" /> HOST ISOLATED</> : <><Lock size={12} className="mr-1" /> Network Quarantine Host</>}
                        </button>
                        <button 
                          onClick={() => triggerSoarAction('ban-ip', investigatingAlert.source_ip)}
                          disabled={soarRunning['ban-ip'] || soarSuccess['ban-ip'] || !investigatingAlert.source_ip}
                          className={`text-xs px-3 py-1.5 border rounded flex items-center transition-all ${soarSuccess['ban-ip'] ? 'bg-soc-success/20 text-soc-success border-soc-success' : 'bg-soc-warning/10 text-soc-warning border-soc-warning/30 hover:bg-soc-warning/20'}`}
                        >
                          {soarRunning['ban-ip'] ? <><Activity size={12} className="mr-1 animate-spin" /> BANNING...</> : soarSuccess['ban-ip'] ? <><CheckCircle size={12} className="mr-1" /> IP BANNED</> : <><Zap size={12} className="mr-1" /> Ban IP at Global Firewall</>}
                        </button>
                      </div>
                      {(soarSuccess['quarantine'] || soarSuccess['ban-ip'] || soarError) && (
                        <div className={`mt-3 p-2 rounded text-[10px] flex items-start animate-in fade-in slide-in-from-left-2 border ${soarError ? 'bg-soc-danger/10 text-soc-danger border-soc-danger/20' : 'bg-soc-success/5 text-soc-success border-soc-success/20'}`}>
                           {soarError ? <AlertTriangle size={12} className="mr-2 shrink-0 mt-0.5" /> : <ShieldCheck size={12} className="mr-2 shrink-0 mt-0.5" />}
                           <span>
                             {soarError ? soarError : `SOAR Action Logged: ${soarSuccess['quarantine'] || soarSuccess['ban-ip']}`}
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-soc-border bg-soc-panel flex justify-between items-center">
               <div className="text-xs text-soc-muted flex items-center">
                 <AlertTriangle size={14} className="mr-1 text-soc-warning" /> Actions are logged in audit trail.
               </div>
               <div className="flex space-x-3">
                 <button 
                  onClick={() => handleStatusChange(investigatingAlert.id, 'false_positive')}
                  className="px-4 py-2 bg-soc-bg border border-soc-border rounded hover:bg-soc-border transition-colors text-sm font-medium"
                 >
                   Mark False Positive
                 </button>
                 <button 
                  onClick={() => handleStatusChange(investigatingAlert.id, 'resolved')}
                  className="px-4 py-2 bg-soc-success text-white rounded hover:bg-green-600 transition-colors text-sm font-medium shadow-lg shadow-soc-success/20 flex items-center"
                 >
                   <CheckCircle size={16} className="mr-2" />
                   Confirm Resolved
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

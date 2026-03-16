import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock, X, AlertTriangle, Activity, Lock, Search, Filter } from 'lucide-react';

export default function AlertsCenter() {
  const [allAlerts, setAllAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('active');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [investigatingAlert, setInvestigatingAlert] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/alerts')
      .then(res => res.json())
      .then(data => {
        setAllAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching alerts:", err);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/alerts/${id}/status?status=${newStatus}`, {
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
    // Ensure the browser treats the timestamp as UTC if it doesn't have a timezone suffix
    const date = new Date(timeStr.endsWith('Z') || timeStr.includes('+') ? timeStr : timeStr + 'Z');
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soc-text">Alerts Center</h2>
          <p className="text-sm text-soc-muted mt-1">Review and triage security detections</p>
        </div>
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
                      <p className="text-xs text-soc-muted mt-1 leading-relaxed">
                        Examine the origin of this alert. The associated IP is <span className="font-mono text-soc-text px-1 bg-black/30 rounded">{investigatingAlert.source_ip || 'Unknown'}</span>. 
                        Launch a query in the Log Explorer filtering by <code>ip_address:{investigatingAlert.source_ip}</code> to check for lateral movement.
                      </p>
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
                        <button className="text-xs px-3 py-1.5 bg-soc-danger/10 text-soc-danger border border-soc-danger/30 rounded flex items-center hover:bg-soc-danger/20 transition-colors">
                          <Lock size={12} className="mr-1" /> Network Quarantine Host
                        </button>
                        <button className="text-xs px-3 py-1.5 bg-soc-warning/10 text-soc-warning border border-soc-warning/30 rounded flex items-center hover:bg-soc-warning/20 transition-colors">
                          <Activity size={12} className="mr-1" /> Ban IP at Global Firewall
                        </button>
                      </div>
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

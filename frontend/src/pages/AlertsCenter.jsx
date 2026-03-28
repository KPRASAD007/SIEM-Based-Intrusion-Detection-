import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock, X, AlertTriangle, Activity, Lock, Search, Filter, Globe, Database, ShieldCheck, ShieldX, Zap, RefreshCw, Target, Scan } from 'lucide-react';

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
    
    const key = `${action}_${target}`;
    setSoarRunning(prev => ({ ...prev, [key]: true }));
    setSoarSuccess(prev => ({ ...prev, [key]: null }));
    setSoarError(null);
    
    try {
      const endpoint = action === 'quarantine' ? `quarantine/${encodeURIComponent(target)}` : `ban-ip/${encodeURIComponent(target)}`;
      const res = await fetch(`http://${window.location.hostname}:8080/api/soar/${endpoint}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setSoarSuccess(prev => ({ ...prev, [key]: data.message }));
      } else {
        const errData = await res.json().catch(() => ({ detail: 'Unknown error' }));
        setSoarError(`SOAR Execution Failed: ${errData.detail || res.statusText}`);
      }
    } catch (err) {
      console.error("SOAR action failed", err);
      setSoarError("Failed to connect to SOAR orchestration service.");
    }
    setSoarRunning(prev => ({ ...prev, [key]: false }));
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-6">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center">
             <ShieldAlert className="mr-3 text-soc-critical" /> THREAT_ALERTS_V2
           </h2>
           <p className="text-[10px] font-bold text-soc-muted tracking-[0.3em] mt-2">ACTIVE INTRUSION DETECTION & TELEMETRY STREAM</p>
        </div>
        <button onClick={fetchAlerts} className="flex items-center px-4 py-2.5 bg-soc-panel/60 border border-soc-border rounded-xl hover:border-soc-primary hover:text-soc-primary hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all text-xs font-bold uppercase tracking-widest self-start">
          <RefreshCw size={14} className={`mr-2.5 ${loading ? 'animate-spin' : ''}`} /> Sync_Detections
        </button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 bg-soc-panel/40 backdrop-blur-xl p-5 rounded-2xl border border-soc-border shadow-2xl">
        <div className="flex items-center mr-4">
            <Filter size={16} className="text-soc-primary mr-3" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Filter_Engage:</span>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <select 
            className="bg-soc-bg/80 border border-soc-border rounded-xl px-4 py-2 text-xs font-bold text-soc-text outline-none transition-all hover:border-soc-primary focus:border-soc-primary cursor-pointer uppercase tracking-widest italic"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">ALL_STATUS_MODES</option>
            <option value="active">ACTIVE_SIGNALS</option>
            <option value="resolved">RESOLVED_CASES</option>
            <option value="false_positive">FALSE_POSITIVES</option>
          </select>
          <select 
            className="bg-soc-bg/80 border border-soc-border rounded-xl px-4 py-2 text-xs font-bold text-soc-text outline-none transition-all hover:border-soc-primary focus:border-soc-primary cursor-pointer uppercase tracking-widest italic"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">ANY_THREAT_LEVEL</option>
            <option value="critical">CRITICAL_THREAT_ONLY</option>
            <option value="high">HIGH_RISK_ONLY</option>
            <option value="medium">MEDIUM_IMPORTANCE</option>
            <option value="low">LOW_PRIORITY</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-soc-panel/20 rounded-2xl border border-soc-border border-dashed">
            <div className="w-12 h-12 border-4 border-soc-primary/10 border-t-soc-primary rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-bold text-soc-primary tracking-[0.4em] uppercase animate-pulse">Synchronizing_SOC_Buffer...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 bg-soc-panel/20 rounded-2xl border border-soc-border border-dashed">
              <ShieldCheck size={48} className="text-soc-primary opacity-20 mb-4" />
              <p className="text-[10px] font-bold text-soc-muted tracking-[0.3em] uppercase italic opacity-40">NO_MATCHING_TELEMETRY_DETECTED_IN_THIS_VIEW</p>
           </div>
        ) : (
          filteredAlerts.map(alert => (
            <div key={alert.id} className="bg-soc-panel/40 backdrop-blur-lg border border-soc-border rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between shadow-xl hover:bg-soc-bg/60 transition-all border-l-4 group relative overflow-hidden"
                 style={{ borderLeftColor: (alert.severity || '').toLowerCase() === 'critical' ? '#ef4444' : (alert.severity || '').toLowerCase() === 'high' ? '#f59e0b' : '#3b82f6' }}>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-soc-primary opacity-0 group-hover:opacity-[0.03] rounded-full -mr-16 -mt-16 transition-opacity pointer-events-none"></div>
              
              <div className="z-10 flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border
                    ${(alert.severity || '').toLowerCase() === 'critical' ? 'text-soc-critical border-soc-critical/30 bg-soc-critical/5 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 
                      (alert.severity || '').toLowerCase() === 'high' ? 'text-soc-warning border-soc-warning/30 bg-soc-warning/5' : 
                      'text-soc-secondary border-soc-secondary/30 bg-soc-secondary/5'}`}>
                    {(alert.severity || 'LOW').toUpperCase()}
                  </span>
                  <p className="text-[10px] font-mono text-soc-muted opacity-60">ID://{alert.id?.slice(-8) || 'DET-UNK'}</p>
                </div>
                
                <h3 className="text-xl font-black text-white italic tracking-tight mb-4 group-hover:text-soc-primary transition-colors">{alert.rule_name}</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-bold text-soc-muted uppercase tracking-widest">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-2 text-soc-primary" />
                    {formatTime(alert.triggered_time)}
                  </div>
                  <div className="flex items-center">
                    <Target size={14} className="mr-2 text-soc-secondary" />
                    MITRE: <span className="ml-1 text-white">{alert.mitre_attack_id}</span>
                  </div>
                  <div className="flex items-center">
                    <Database size={14} className="mr-2 text-accent" />
                    HOST: <span className="ml-1 text-white font-mono">{alert.affected_host || 'N/A'}</span>
                  </div>
                  {alert.source_ip && (
                    <div className="flex items-center">
                      <Globe size={14} className="mr-2 text-soc-primary" />
                      VECTOR: <span className="ml-1 text-soc-primary font-mono">{alert.source_ip}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 lg:mt-0 flex space-x-3 z-10 shrink-0">
                <button 
                  onClick={() => startInvestigation(alert)}
                  className="flex-1 lg:flex-none px-6 py-2.5 bg-soc-bg border border-soc-border rounded-xl text-xs font-black uppercase tracking-widest hover:border-soc-primary hover:text-soc-primary transition-all shadow-xl italic"
                >
                  <Search size={14} className="inline mr-2" /> Playbook
                </button>
                <button 
                  onClick={() => handleStatusChange(alert.id, 'resolved')}
                  className="flex-1 lg:flex-none px-6 py-2.5 bg-soc-primary/10 text-soc-primary border border-soc-primary/30 rounded-xl hover:bg-soc-primary hover:text-soc-bg transition-all text-xs font-black uppercase tracking-widest shadow-xl italic"
                >
                   Resolve
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Investigation Modal */}
      {investigatingAlert && (
        <div className="fixed inset-0 z-[200] bg-soc-bg/95 flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300 backdrop-blur-3xl">
          <div className="bg-soc-panel border-2 border-soc-primary/20 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-6xl h-full flex flex-col overflow-hidden relative">
            
            <div className="absolute top-0 right-0 p-8 z-10">
               <button onClick={() => setInvestigatingAlert(null)} className="p-3 bg-soc-bg/80 border border-soc-border text-white rounded-2xl hover:border-soc-primary transition-all shadow-xl">
                 <X size={24} />
               </button>
            </div>

            <div className="p-10 lg:p-14 overflow-y-auto custom-scrollbar flex-1">
               <div className="mb-12">
                  <div className="flex items-center space-x-4 mb-3">
                     <span className="p-3 bg-soc-critical/20 rounded-2xl text-soc-critical border border-soc-critical/30 animate-pulse">
                        <ShieldAlert size={32} />
                     </span>
                     <div>
                        <p className="text-soc-primary font-black text-xs uppercase tracking-[0.4em] mb-1 italic">Tactical_Intelligence_Report</p>
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter italic uppercase">{investigatingAlert.rule_name}</h2>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                  <div className="bg-soc-bg/40 border border-soc-border p-5 rounded-2xl">
                     <p className="text-[9px] font-black text-soc-muted uppercase tracking-widest mb-1">Threat_Level</p>
                     <p className="text-lg font-black text-soc-critical italic">{(investigatingAlert.severity || 'UNKNOWN').toUpperCase()}</p>
                  </div>
                  <div className="bg-soc-bg/40 border border-soc-border p-5 rounded-2xl">
                     <p className="text-[9px] font-black text-soc-muted uppercase tracking-widest mb-1">Target_Endpoint</p>
                     <p className="text-lg font-black text-white italic font-mono">{investigatingAlert.affected_host || 'N/A'}</p>
                  </div>
                  <div className="bg-soc-bg/40 border border-soc-border p-5 rounded-2xl">
                     <p className="text-[9px] font-black text-soc-muted uppercase tracking-widest mb-1">Attacker_Source</p>
                     <p className="text-lg font-black text-soc-secondary italic font-mono">{investigatingAlert.source_ip || 'N/A'}</p>
                  </div>
                  <div className="bg-soc-bg/40 border border-soc-border p-5 rounded-2xl">
                     <p className="text-[9px] font-black text-soc-muted uppercase tracking-widest mb-1">MITRE_Technique</p>
                     <p className="text-lg font-black text-accent italic">{investigatingAlert.mitre_attack_id}</p>
                  </div>
               </div>

               <div className="space-y-10">
                  <div className="bg-soc-bg/20 border border-soc-border p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Database size={80} />
                    </div>
                    <div className="flex items-start mb-8">
                       <div className="w-10 h-10 rounded-xl bg-soc-primary/10 text-soc-primary flex items-center justify-center font-black italic mr-5 shrink-0 border border-soc-primary/20">01</div>
                       <div>
                          <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Threat_Enrichment_Protocol</h4>
                          <p className="text-xs text-soc-muted mt-1 font-bold">QUERYING EXTERNAL CYBER RANGE DATABASES</p>
                       </div>
                    </div>
                    
                    <div className="space-y-6 pl-14">
                        {!intelData ? (
                          <div className="space-y-4 max-w-md">
                            <button 
                              onClick={() => fetchThreatIntel(investigatingAlert.source_ip)}
                              disabled={fetchingIntel || !investigatingAlert.source_ip}
                              className={`w-full group py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all flex items-center justify-center ${fetchingIntel ? 'bg-soc-primary/10 text-soc-primary border-soc-primary/40 animate-pulse' : 'bg-soc-bg border-soc-border text-soc-muted hover:border-soc-primary hover:text-white shadow-xl'}`}
                            >
                              <Activity size={18} className="mr-3" />
                              {fetchingIntel ? 'POLLING_INTELLIGENCE_API...' : 'ENRICH_WITH_CYBER_INTEL'}
                            </button>
                            {intelError && (
                              <div className="p-4 bg-soc-critical/5 border border-soc-critical/20 rounded-xl text-[10px] font-bold text-soc-critical uppercase tracking-widest italic flex items-start">
                                <AlertTriangle size={14} className="mr-3 mt-0.5" />
                                {intelError}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-soc-bg/40 border border-soc-border rounded-2xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Scan size={20} className="text-soc-primary" />
                                <span className={`text-sm font-black italic tracking-widest uppercase ${intelData.verdict === 'CRITICAL RISK' ? 'text-soc-critical' : 'text-soc-warning'}`}>
                                  VERDICT_{intelData.verdict?.replace(' ', '_')}
                                </span>
                              </div>
                              <div className="text-[10px] font-black text-soc-muted uppercase tracking-[0.2em] opacity-50 italic">Confidence_Level: 98.4%</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-3">
                                  <p className="text-[9px] font-black text-soc-primary uppercase tracking-widest flex items-center">
                                     <Globe size={12} className="mr-2" /> Global_Origin
                                  </p>
                                  <div className="p-4 bg-soc-bg/80 border border-soc-border rounded-xl">
                                     <p className="text-xl font-black text-white italic">{intelData.geodata.city}, {intelData.geodata.country}</p>
                                     <p className="text-[10px] text-soc-muted font-mono mt-1 mt-2">{intelData.geodata.asn}</p>
                                  </div>
                               </div>
                               <div className="space-y-3">
                                  <p className="text-[9px] font-black text-soc-secondary uppercase tracking-widest flex items-center">
                                     <Activity size={12} className="mr-2" /> Malware_Heuristics
                                  </p>
                                  <div className="flex gap-4">
                                     <div className="flex-1 p-4 bg-soc-bg/80 border border-soc-border rounded-xl">
                                        <p className="text-[9px] font-bold text-soc-muted uppercase mb-1">Provider_Hits</p>
                                        <div className="flex items-end space-x-1">
                                           <span className="text-2xl font-black text-soc-critical leading-none">{intelData.threat_details.provider_hits.virustotal}</span>
                                           <span className="text-[10px] font-mono text-soc-muted mb-1">/ 72</span>
                                        </div>
                                     </div>
                                     <div className="flex-1 p-4 bg-soc-bg/80 border border-soc-border rounded-xl">
                                        <p className="text-[9px] font-bold text-soc-muted uppercase mb-1">Threat_Score</p>
                                        <div className="flex items-end space-x-1">
                                           <span className="text-2xl font-black text-soc-warning leading-none">{intelData.summary.score}</span>
                                           <span className="text-[10px] font-mono text-soc-muted mb-1">%</span>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="bg-soc-bg/20 border border-soc-border p-8 rounded-3xl relative group">
                    <div className="flex items-start mb-6">
                       <div className="w-10 h-10 rounded-xl bg-soc-secondary/10 text-soc-secondary flex items-center justify-center font-black italic mr-5 shrink-0 border border-soc-secondary/20">02</div>
                       <div>
                          <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">SOAR_Auto_Orchestration</h4>
                          <p className="text-xs text-soc-muted mt-1 font-bold">ONE-CLICK MITIGATION & CONTAINMENT</p>
                       </div>
                    </div>
                    
                    <div className="pl-14">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                        <button 
                          onClick={() => triggerSoarAction('quarantine', investigatingAlert.affected_host)}
                          disabled={soarRunning[`quarantine_${investigatingAlert.affected_host}`] || soarSuccess[`quarantine_${investigatingAlert.affected_host}`] || !investigatingAlert.affected_host}
                          className={`group p-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center justify-center
                            ${soarSuccess[`quarantine_${investigatingAlert.affected_host}`] ? 'bg-soc-primary/10 text-soc-primary border-soc-primary/40' : 'bg-soc-bg border-soc-border text-soc-muted hover:border-soc-critical hover:text-white shadow-xl hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}
                        >
                          {soarRunning[`quarantine_${investigatingAlert.affected_host}`] ? <Activity size={16} className="mr-3 animate-spin" /> : <Lock size={16} className="mr-3 group-hover:text-soc-critical" />}
                          {soarRunning[`quarantine_${investigatingAlert.affected_host}`] ? 'INITIALIZING_ISOLATION...' : soarSuccess[`quarantine_${investigatingAlert.affected_host}`] ? 'HOST_IN_QUARANTINE' : 'Isolate_Affected_Host'}
                        </button>
                        <button 
                          onClick={() => triggerSoarAction('ban-ip', investigatingAlert.source_ip)}
                          disabled={soarRunning[`ban-ip_${investigatingAlert.source_ip}`] || soarSuccess[`ban-ip_${investigatingAlert.source_ip}`] || !investigatingAlert.source_ip}
                          className={`group p-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center justify-center
                            ${soarSuccess[`ban-ip_${investigatingAlert.source_ip}`] ? 'bg-soc-primary/10 text-soc-primary border-soc-primary/40' : 'bg-soc-bg border-soc-border text-soc-muted hover:border-soc-warning hover:text-white shadow-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'}`}
                        >
                          {soarRunning[`ban-ip_${investigatingAlert.source_ip}`] ? <Activity size={16} className="mr-3 animate-spin" /> : <Zap size={16} className="mr-3 group-hover:text-soc-warning" />}
                          {soarRunning[`ban-ip_${investigatingAlert.source_ip}`] ? 'DROPPING_PACKETS...' : soarSuccess[`ban-ip_${investigatingAlert.source_ip}`] ? 'IP_BANNED_AT_FW' : 'Ban_Source_Vector_IP'}
                        </button>
                      </div>
                      
                      {(soarSuccess[`quarantine_${investigatingAlert.affected_host}`] || soarSuccess[`ban-ip_${investigatingAlert.source_ip}`] || soarError) && (
                        <div className={`mt-6 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-start animate-in fade-in slide-in-from-left-4 border shadow-xl ${soarError ? 'bg-soc-critical/5 text-soc-critical border-soc-critical/20' : 'bg-soc-primary/5 text-soc-primary border-soc-primary/20'}`}>
                           {soarError ? <ShieldX size={16} className="mr-4 shrink-0" /> : <ShieldCheck size={16} className="mr-4 shrink-0" />}
                           <span>{soarError ? soarError : `SOAR_LOG_EVENT: ${soarSuccess[`quarantine_${investigatingAlert.affected_host}`] || soarSuccess[`ban-ip_${investigatingAlert.source_ip}`]}`}</span>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-8 lg:p-10 bg-soc-bg border-t border-soc-border flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="text-[10px] font-mono text-soc-muted uppercase tracking-[0.2em] flex items-center italic">
                 <AlertTriangle size={16} className="mr-3 text-soc-warning" /> REMEDIATION_PROTOCOL_AUDITED_LOGGED
               </div>
               <div className="flex space-x-4 w-full md:w-auto">
                 <button 
                  onClick={() => handleStatusChange(investigatingAlert.id, 'false_positive')}
                  className="flex-1 md:flex-none px-8 py-3 bg-soc-panel border border-soc-border rounded-xl text-xs font-black uppercase tracking-widest hover:border-white transition-all italic text-soc-muted hover:text-white"
                 >
                   NO_ATTACK_DETECTED
                 </button>
                 <button 
                  onClick={() => handleStatusChange(investigatingAlert.id, 'resolved')}
                  className="flex-1 md:flex-none px-10 py-3 bg-soc-primary text-soc-bg rounded-xl text-xs font-black uppercase tracking-widest hover:bg-soc-hacker transition-all italic shadow-[0_0_30px_rgba(16,185,129,0.25)] flex items-center justify-center"
                 >
                   <CheckCircle size={18} className="mr-2" />
                   COMMIT_RESOLUTION
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

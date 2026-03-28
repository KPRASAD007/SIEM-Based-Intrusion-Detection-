import React, { useState, useEffect } from 'react';
import { Server, Activity, ArrowDownToLine, RefreshCw, Terminal, Globe, Network, Search, Filter, X, ShieldCheck, Target } from 'lucide-react';

export default function RemoteSensors() {
  const [remoteLogs, setRemoteLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHosts, setActiveHosts] = useState([]);
  const [filterNoise, setFilterNoise] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeploymentGuide, setShowDeploymentGuide] = useState(false);

  const fetchRemoteLogs = () => {
    setLoading(true);
    fetch(`http://${window.location.hostname}:8080/api/logs`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(log => log.details?.source === "Advanced Forwarder v2" || log.details?.source === "Remote Windows Forwarder");
        // Hide invisible heartbeats from the visual table
        setRemoteLogs(filtered.filter(l => l.event_id !== "HEARTBEAT-001"));
        
        // Track unique computer hostnames and mark exactly when they were last seen!
        const hostMap = {};
        filtered.forEach(log => {
           const host = log.details?.host || log.ip_address;
           if (!host) return;
           const logTime = new Date(log.timestamp?.endsWith('Z') ? log.timestamp : log.timestamp + 'Z').getTime();
           if (!hostMap[host] || logTime > hostMap[host].lastSeen) {
               hostMap[host] = { host, lastSeen: logTime };
           }
        });
        setActiveHosts(Object.values(hostMap).sort((a,b) => b.lastSeen - a.lastSeen));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching remote logs:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRemoteLogs();
  }, []);

  const displayLogs = remoteLogs.filter(log => {
    if (filterNoise && (!log.severity || log.severity.toLowerCase() === 'low')) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const p = (log.process_name || '').toLowerCase();
      const u = (log.user || '').toLowerCase();
      if (!p.includes(q) && !u.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center">
            <Globe className="mr-4 text-soc-secondary animate-pulse" size={36} /> REMOTE_SENSORS_V1.4
          </h2>
          <p className="text-[10px] font-bold text-soc-muted tracking-[0.4em] mt-3">LIVE ENDPOINT TELEMETRY & GLOBAL FORWARDER MANAGEMENT</p>
        </div>
        <button 
          onClick={fetchRemoteLogs} 
          className="px-8 py-3.5 bg-soc-panel/60 border-2 border-soc-border text-white rounded-xl hover:border-soc-secondary hover:text-soc-secondary transition-all text-xs font-black uppercase tracking-widest italic flex items-center shadow-xl group"
        >
          <RefreshCw size={18} className={`mr-3 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} /> SYNC_SENSOR_GRID
        </button>
      </div>

      {/* Sensor Grid Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-soc-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="absolute -top-12 -right-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 pointer-events-none">
            <Network size={200} />
          </div>
          
          <div className="flex items-center space-x-6 mb-10 relative z-10">
             <div className="p-5 bg-soc-secondary/10 rounded-3xl text-soc-secondary border-2 border-soc-secondary/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                <Globe size={32} />
             </div>
             <div>
                <h3 className="font-black text-white text-2xl italic tracking-tighter uppercase">SENSOR_NODES</h3>
                <p className="text-[10px] text-soc-muted font-bold tracking-widest uppercase opacity-60">ACTIVE_GRID_RELAYS</p>
             </div>
          </div>
          
          <div className="flex items-end justify-between relative z-10">
            <div className="flex flex-col">
              <span className="text-6xl font-black text-white italic tracking-tighter">{activeHosts.length.toString().padStart(2, '0')}</span>
              <span className="text-[10px] font-black text-soc-secondary uppercase tracking-[0.3em] mt-2">DEPLOYED_AGENTS</span>
            </div>
            <button 
                onClick={() => setShowDeploymentGuide(!showDeploymentGuide)}
                className={`flex items-center px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic border-2 transition-all shadow-xl
                  ${showDeploymentGuide ? 
                    'bg-soc-bg border-soc-border text-soc-muted hover:border-white hover:text-white' : 
                    'bg-soc-secondary/10 border-soc-secondary/30 text-soc-secondary hover:bg-soc-secondary hover:text-soc-bg shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                  }`}
            >
                <ArrowDownToLine size={14} className="mr-2.5" /> {showDeploymentGuide ? 'CLOSE_MANIFEST' : 'PROVISION_NODE'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-soc-panel/20 backdrop-blur-xl border-2 border-soc-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
           <h3 className="text-sm font-black text-white italic tracking-widest uppercase mb-8 flex items-center">
             <Activity className="mr-3 text-soc-secondary" size={18} /> ACTIVE_FORWARDER_TOPOLOGY
           </h3>
           
           {activeHosts.length === 0 && !showDeploymentGuide ? (
             <div className="h-40 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-soc-border rounded-3xl opacity-40">
                <ArrowDownToLine size={32} className="animate-bounce" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">AWAITING_INITIAL_HANDSHAKE...</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeHosts.map(h => {
                  const isOffline = (Date.now() - h.lastSeen) > (2 * 60 * 1000);
                  return (
                  <div key={h.host} className={`group flex items-center bg-soc-bg border-2 p-5 rounded-[1.5rem] transition-all duration-500 relative overflow-hidden
                    ${isOffline ? 'border-soc-critical/20 opacity-50 grayscale' : 'border-soc-border hover:border-soc-secondary hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]'}`}>
                    <div className={`absolute top-0 right-0 w-2 h-full ${isOffline ? 'bg-soc-critical' : 'bg-soc-secondary'}`}></div>
                    <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-soc-critical' : 'bg-soc-secondary animate-pulse'} mr-5 shadow-[0_0_15px_rgba(6,182,212,0.5)]`}></div>
                    <div className="flex-1">
                      <div className="flex items-center text-soc-muted mb-1 text-[8px] font-black uppercase tracking-widest group-hover:text-soc-secondary transition-colors">
                        <Server size={10} className="mr-2" /> HOST_IDENTIFIER
                      </div>
                      <span className="font-mono text-sm font-black text-white tracking-tight">{h.host}</span>
                    </div>
                    {isOffline && (
                      <div className="px-3 py-1 bg-soc-critical/20 rounded-lg border border-soc-critical/40 ml-4 animate-in fade-in zoom-in duration-500">
                         <span className="text-[8px] text-soc-critical font-black uppercase tracking-widest">TIMEOUT</span>
                      </div>
                    )}
                  </div>
                  );
                })}
             </div>
           )}
        </div>
      </div>

      {/* Deployment Protocol Modal */}
      {showDeploymentGuide && (
          <div className="bg-soc-bg/80 backdrop-blur-3xl border-4 border-soc-secondary rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 fade-in duration-500 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-soc-secondary to-transparent"></div>
             
             <div className="flex items-center justify-between mb-12 border-b-2 border-soc-border pb-8">
                <div className="flex items-center space-x-6">
                    <div className="p-4 bg-soc-secondary/10 rounded-2xl border-2 border-soc-secondary/20 text-soc-secondary shadow-lg">
                       <Terminal size={32} />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-3xl italic tracking-tighter uppercase">FORWARDER_PROVISIONING_MANIFEST</h3>
                      <p className="text-[10px] font-bold text-soc-muted tracking-[0.4em] mt-1 uppercase opacity-60">EXECUTE ON TARGET ENDPOINT TO INITIALIZE TELEMETRY</p>
                    </div>
                </div>
                <button onClick={() => setShowDeploymentGuide(false)} className="p-4 bg-soc-panel border-2 border-soc-border text-white rounded-2xl hover:border-soc-critical hover:text-soc-critical transition-all">
                   <X size={24} />
                </button>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-3 space-y-10">
                    <div className="space-y-6">
                       {[
                         { step: "01", text: "OPEN POWER_SHELL TERMINAL (ELEVATED_ADMIN_PRIVILEGES)" },
                         { step: "02", text: "VERIFY PORT 8080 IS ACCESSIBLE VIA NETWORK_FIREWALL" },
                         { step: "03", text: "EXECUTE GLOBAL_INIT_STRING PROVIDED ON DASHBOARD" }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center space-x-6 p-4 bg-soc-panel/40 border-2 border-soc-border rounded-2xl group/step">
                            <span className="text-xl font-black text-soc-secondary italic group-hover:scale-110 transition-transform">{item.step}</span>
                            <span className="text-[11px] font-black text-white uppercase tracking-widest opacity-80">{item.text}</span>
                         </div>
                       ))}
                    </div>

                    <div className="mt-8 relative group/code p-1">
                        <div className="absolute -inset-1 bg-gradient-to-r from-soc-secondary to-transparent rounded-[2rem] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="bg-[#0b0e14] border-2 border-soc-secondary/30 rounded-[1.5rem] p-8 font-mono text-sm relative overflow-hidden">
                          <div className="flex items-center space-x-2 text-[9px] font-black text-soc-muted/40 uppercase tracking-[0.3em] mb-4">
                             <div className="w-2 h-2 rounded-full bg-soc-secondary"></div>
                             <span>SECURE_PAYLOAD_V2.SYSEXE</span>
                          </div>
                          <code className="text-soc-secondary break-all leading-relaxed block pr-12">
                             $s="{window.location.hostname}"; iwr -useb "http://$s:8080/api/download/agent" | iex
                          </code>
                          <button className="absolute top-6 right-6 p-3 bg-soc-secondary/10 hover:bg-soc-secondary text-soc-secondary hover:text-soc-bg border-2 border-soc-secondary/20 rounded-xl transition-all shadow-xl">
                              <Target size={18} />
                          </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-soc-panel border-2 border-soc-border rounded-[2.5rem] p-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-soc-secondary/5 group-hover:bg-soc-secondary/10 transition-colors"></div>
                        <h4 className="text-[10px] font-black text-soc-secondary uppercase tracking-[0.4em] mb-8 flex items-center italic shrink-0">
                           <ShieldCheck size={16} className="mr-3" /> CONNECTION_PARAMS
                        </h4>
                        <div className="space-y-6 relative z-10">
                            {[
                              { label: "SIEM_ENDPOINT", value: window.location.hostname, mono: true },
                              { label: "COMM_PORT", value: "8080", mono: true },
                              { label: "ENCRYPTION", value: "MOCK_TLS_V1.2", mono: false },
                              { label: "STATUS", value: "READY_FOR_SYNC", mono: false, highlight: true }
                            ].map((p, i) => (
                              <div key={i} className="flex flex-col space-y-2 border-b border-soc-border/50 pb-4">
                                <span className="text-[8px] font-black text-soc-muted uppercase tracking-widest">{p.label}</span>
                                <span className={`text-sm font-black ${p.mono ? 'font-mono' : 'italic'} ${p.highlight ? 'text-soc-primary' : 'text-white'} uppercase tracking-tight`}>{p.value}</span>
                              </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-8 bg-soc-secondary/5 border-2 border-soc-secondary/30 rounded-[2rem] flex flex-col items-center text-center space-y-4">
                       <Globe size={40} className="text-soc-secondary animate-pulse" />
                       <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">MONITORING_AGENTS_VIA_BROKER_v1.0</p>
                    </div>
                </div>
             </div>
          </div>
      )}

      {/* Telemetry Stream Analysis */}
      <div className="bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="p-10 border-b-2 border-soc-border bg-soc-bg/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-soc-secondary"></div>
            <div>
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center mb-2">
                <Terminal size={24} className="mr-4 text-soc-secondary" /> ENDPOINT_SIGNAL_STREAM
              </h3>
              <p className="text-[9px] font-bold text-soc-muted tracking-[0.4em] uppercase opacity-40">DECODING REAL-TIME REMOTE TELEMETRY BURSTS</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
               <div className="flex items-center bg-soc-bg border-2 border-soc-border rounded-2xl px-5 py-3 focus-within:border-soc-secondary transition-all w-full md:w-80 group/search shadow-xl">
                 <Search size={18} className="text-soc-muted mr-4 group-focus-within/search:text-soc-secondary transition-colors" />
                 <input 
                   type="text" 
                   placeholder="SEARCH_PROCESS_IMAGE..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-transparent border-none text-sm font-bold text-white w-full outline-none placeholder:text-soc-muted/30 uppercase italic"
                 />
               </div>
               <button 
                 onClick={() => setFilterNoise(!filterNoise)}
                 className={`flex items-center px-6 py-3 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest italic shadow-xl
                   ${filterNoise ? 'bg-soc-secondary text-soc-bg border-soc-secondary' : 'bg-soc-bg border-soc-border text-soc-muted hover:border-white hover:text-white'}`}
               >
                 <Filter size={16} className="mr-3" /> {filterNoise ? 'CLEAN_VIEW' : 'FILTER_NOISE'}
               </button>
               <div className="hidden sm:flex items-center space-x-4 bg-soc-bg border-2 border-soc-border px-6 py-3 rounded-2xl shadow-xl">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white text-center leading-none tracking-tight">{displayLogs.length} / {remoteLogs.length}</span>
                      <span className="text-[7px] font-black text-soc-muted text-center uppercase tracking-widest mt-1">TELEMETRY_COUNT</span>
                   </div>
               </div>
            </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0b0e14]/50 text-soc-muted border-b border-soc-border text-[9px] font-black uppercase tracking-[0.2em] italic">
              <tr>
                <th className="px-8 py-6">TELEMETRY_STAMP</th>
                <th className="px-8 py-6">SIGNAL_ORIGIN_IP</th>
                <th className="px-8 py-6">HOST_NOD_ID</th>
                <th className="px-8 py-6">PROCESS_HEX_IMAGE</th>
                <th className="px-8 py-6">SUBJECT_IDENTITY</th>
                <th className="px-8 py-6 text-right">SYSTEM_SEVERITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border">
              {loading ? (
                <tr><td colSpan="6" className="px-8 py-32 text-center bg-soc-bg/20">
                   <div className="flex flex-col items-center space-y-4">
                      <div className="w-10 h-10 border-4 border-soc-secondary/20 border-t-soc-secondary rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-soc-secondary uppercase tracking-[0.3em] animate-pulse">DECODING_PAYLOAD_BUFFER...</p>
                   </div>
                </td></tr>
              ) : displayLogs.length === 0 ? (
                <tr><td colSpan="6" className="px-8 py-40 text-center bg-soc-bg/20">
                  <div className="flex flex-col items-center space-y-6 opacity-30">
                    <Globe size={80} className="text-soc-muted animate-pulse" />
                    <div className="space-y-2">
                       <p className="text-3xl font-black text-white italic tracking-tighter uppercase">ZERO_REMOTE_SIGNALS</p>
                       <p className="text-[10px] text-soc-muted font-bold tracking-[0.3em] uppercase">INITIALIZE_AGENT_TO_START_TELEMETRY_LINK</p>
                    </div>
                  </div>
                </td></tr>
              ) : (
                displayLogs.map(log => {
                  let timeString = "N/A";
                  if (log.timestamp) {
                      try {
                          const d = new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z');
                          timeString = d.toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                          }).replace(',', '');
                      } catch(e) {}
                  }
                  
                  return (
                    <tr key={log.id || log._id || Math.random()} className="hover:bg-soc-secondary/[0.03] group transition-all duration-300">
                      <td className="px-8 py-5 text-soc-muted font-mono text-[10px] uppercase tracking-tighter italic">{timeString}</td>
                      <td className="px-8 py-5 text-soc-secondary font-mono text-xs font-black shadow-inner italic">
                         <span className="bg-soc-secondary/5 px-3 py-1 rounded-xl border border-soc-secondary/10 group-hover:bg-soc-secondary/20 transition-all">{log.ip_address || 'LOCAL_IO'}</span>
                      </td>
                      <td className="px-8 py-5 font-black text-white italic tracking-tight uppercase group-hover:text-soc-secondary transition-colors">{log.details?.host || log.details?.Computer || 'NULL_NODE'}</td>
                      <td className="px-8 py-5">
                         <div className="flex items-center space-x-3 bg-soc-bg/50 px-4 py-2 rounded-2xl border border-soc-border group-hover:border-soc-secondary/30 transition-all">
                            <ArrowDownToLine size={12} className="text-soc-muted" />
                            <span className="font-mono text-[10px] text-soc-muted font-black uppercase tracking-tight">{log.process_name || 'SYSTEM_CORE'}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                           <div className="w-8 h-8 rounded-2xl bg-soc-panel border-2 border-soc-border flex items-center justify-center text-[10px] font-black text-white italic shadow-lg group-hover:border-soc-secondary transition-all">
                              {(log.user && log.user !== 'Unknown' && log.user !== 'System') ? log.user.charAt(0).toUpperCase() : 'S'}
                           </div>
                           <span className="text-[11px] font-black text-white italic tracking-widest uppercase opacity-80 group-hover:opacity-100">{log.user || 'SYSTEM_DAEMON'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic border-2 transition-all shadow-xl
                          ${log.severity?.toLowerCase() === 'high' || log.severity?.toLowerCase() === 'critical' ? 'bg-soc-critical/5 text-soc-critical border-soc-critical/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 
                            log.severity?.toLowerCase() === 'medium' ? 'bg-soc-warning/10 text-soc-warning border-soc-warning/40' : 'bg-soc-primary/5 text-soc-primary border-soc-primary/40'}`}>
                          {log.severity ? log.severity.toUpperCase() : 'TELEMETRY'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

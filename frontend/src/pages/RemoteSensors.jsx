import React, { useState, useEffect } from 'react';
import { Server, Activity, ArrowDownToLine, RefreshCw, Terminal, Globe, Network, Search, Filter } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soc-text">Remote Sensors</h2>
          <p className="text-sm text-soc-muted mt-1">Live Endpoint Telemetry from external connected devices</p>
        </div>
        <button onClick={fetchRemoteLogs} className="flex items-center px-4 py-2 bg-soc-panel border border-soc-border rounded hover:border-soc-primary hover:text-soc-primary transition-colors text-sm shadow-lg">
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Agents
        </button>
      </div>

      {/* Active Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-soc-panel border border-soc-border rounded-lg p-6 shadow-lg relative overflow-hidden group/card">
          <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
            <Network size={120} />
          </div>
          <div className="flex items-center space-x-3 mb-4">
             <div className="p-2 bg-soc-primary/20 rounded-lg text-soc-primary border border-soc-primary/30">
                <Globe size={24} />
             </div>
             <div>
                <h3 className="font-bold text-soc-text text-lg">Connected Hosts</h3>
                <p className="text-xs text-soc-muted">Active Remote Agents</p>
             </div>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-soc-text to-soc-muted">{activeHosts.length}</p>
            <button 
                onClick={() => setShowDeploymentGuide(!showDeploymentGuide)}
                className="text-[10px] font-bold text-soc-primary hover:text-white bg-soc-primary/10 hover:bg-soc-primary px-3 py-1 rounded border border-soc-primary/30 transition-all uppercase tracking-widest"
            >
                {showDeploymentGuide ? 'Hide Guide' : 'Deploy Agent'}
            </button>
          </div>
        </div>

        <div className="bg-soc-panel border border-soc-border rounded-lg p-6 shadow-lg md:col-span-2">
           <h3 className="font-bold text-soc-text mb-4 text-sm uppercase tracking-wider border-b border-soc-border pb-2">Active Forwarders</h3>
           {activeHosts.length === 0 && !showDeploymentGuide ? (
             <p className="text-soc-muted text-sm flex items-center h-full pb-4">
               <ArrowDownToLine size={16} className="mr-2" /> Waiting for first remote connection...
             </p>
           ) : (
             <div className="flex flex-wrap gap-3">
               {activeHosts.map(h => {
                 const isOffline = (Date.now() - h.lastSeen) > (2 * 60 * 1000); // 2 mins offline threshold
                 return (
                 <div key={h.host} className={`flex items-center bg-soc-bg border ${isOffline ? 'border-soc-danger/30 opacity-70' : 'border-soc-border hover:border-soc-primary'} rounded px-4 py-2 transition-colors cursor-default shadow-sm`}>
                   <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-soc-danger' : 'bg-soc-success animate-pulse'} mr-3`}></div>
                   <Server size={16} className="text-soc-muted mr-2" />
                   <span className="font-mono text-sm text-soc-text">{h.host}</span>
                   {isOffline && <span className="ml-2 text-[10px] text-soc-danger font-bold uppercase tracking-wider bg-soc-danger/10 px-1 rounded">Offline</span>}
                 </div>
                 );
               })}
             </div>
           )}
        </div>
      </div>

      {/* Deployment Guide Section */}
      {showDeploymentGuide && (
          <div className="bg-soc-panel border-2 border-soc-primary/50 rounded-xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between mb-4 border-b border-soc-border pb-3">
                <div className="flex items-center space-x-2">
                    <Terminal size={20} className="text-soc-primary" />
                    <h3 className="font-bold text-soc-text uppercase tracking-widest text-sm">Remote Agent Deployment Guide</h3>
                </div>
                <X size={18} className="text-soc-muted cursor-pointer hover:text-soc-danger" onClick={() => setShowDeploymentGuide(false)} />
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <p className="text-xs text-soc-muted leading-relaxed">
                        To stream logs from a secondary Windows computer, follow these steps:
                    </p>
                    <ol className="space-y-3">
                        <li className="text-[11px] text-soc-text flex items-start">
                            <span className="w-5 h-5 rounded-full bg-soc-primary/20 text-soc-primary flex items-center justify-center font-bold mr-3 shrink-0">1</span>
                            Open <b>PowerShell (as Admin)</b> on the target machine.
                        </li>
                        <li className="text-[11px] text-soc-text flex items-start">
                            <span className="w-5 h-5 rounded-full bg-soc-primary/20 text-soc-primary flex items-center justify-center font-bold mr-3 shrink-0">2</span>
                            Run the command below (Ensure firewall allows port 8080).
                        </li>
                    </ol>
                    <div className="mt-4 p-4 bg-[#0B0E14] rounded border border-soc-border relative group/code">
                        <code className="text-[10px] text-soc-success break-all font-mono">
                           $s="{window.location.hostname}"; iwr -useb "http://$s:8080/api/download/agent" | iex
                        </code>
                        <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                            <span className="text-[8px] bg-soc-primary px-2 py-0.5 rounded text-white font-bold cursor-pointer">COPY</span>
                        </div>
                    </div>
                </div>
                <div className="bg-soc-bg p-4 rounded border border-soc-border flex flex-col justify-center">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-soc-warning/20 rounded text-soc-warning border border-soc-warning/30">
                            <Server size={20} />
                        </div>
                        <h4 className="text-xs font-bold text-soc-text">Connection Parameters</h4>
                    </div>
                    <ul className="space-y-2">
                        <li className="flex items-center justify-between text-[11px]">
                            <span className="text-soc-muted">SIEM Server:</span>
                            <span className="font-mono text-soc-primary">{window.location.hostname}</span>
                        </li>
                        <li className="flex items-center justify-between text-[11px]">
                            <span className="text-soc-muted">API Port:</span>
                            <span className="font-mono text-soc-primary">8080</span>
                        </li>
                        <li className="flex items-center justify-between text-[11px]">
                            <span className="text-soc-muted">Log Forwarding:</span>
                            <span className="text-soc-success font-bold">Enabled</span>
                        </li>
                    </ul>
                </div>
             </div>
          </div>
      )}

      <div className="bg-soc-panel border border-soc-border rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 border-b border-soc-border bg-gradient-to-r from-soc-bg to-soc-panel flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
            <h3 className="font-bold text-soc-text flex items-center shrink-0">
              <Terminal size={18} className="mr-2 text-soc-primary" /> External Endpoint Stream
            </h3>
            
            <div className="flex items-center space-x-3 w-full md:w-auto">
               <div className="flex items-center bg-soc-bg px-3 py-1.5 rounded border border-soc-border focus-within:border-soc-primary transition-colors flex-1 md:w-64">
                 <Search size={14} className="text-soc-muted mr-2 shrink-0" />
                 <input 
                   type="text" 
                   placeholder="Search process..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-transparent border-none text-sm text-soc-text w-full outline-none placeholder-soc-muted"
                 />
               </div>
               <button 
                 onClick={() => setFilterNoise(!filterNoise)}
                 className={`flex items-center px-3 py-1.5 rounded border transition-colors text-sm shrink-0 shadow-sm ${filterNoise ? 'bg-soc-primary/10 text-soc-primary border-soc-primary/50' : 'bg-soc-bg/50 text-soc-muted border-soc-border hover:bg-soc-bg'}`}
               >
                 <Filter size={14} className="mr-2" /> {filterNoise ? 'Noise Hidden' : 'Hide Noise'}
               </button>
               <span className="text-xs font-bold bg-soc-bg px-3 py-1.5 rounded border border-soc-border text-soc-muted shrink-0 hidden sm:block">
                  {displayLogs.length} / {remoteLogs.length} LOGS
               </span>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0B0E14] text-soc-muted border-b border-soc-border text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Network Time</th>
                <th className="px-6 py-4 font-bold">Target IP</th>
                <th className="px-6 py-4 font-bold">Remote Host</th>
                <th className="px-6 py-4 font-bold">Process Origin</th>
                <th className="px-6 py-4 font-bold">Subject User</th>
                <th className="px-6 py-4 font-bold">Analyst Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-soc-muted bg-soc-bg/30">Syncing telemetry streams...</td></tr>
              ) : displayLogs.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-soc-muted bg-soc-bg/30">
                  <Globe size={48} className="mx-auto mb-4 opacity-20" />
                  No remote agent logs found. Run the PowerShell Forwarder on another computer to see data here.
                </td></tr>
              ) : (
                displayLogs.map(log => {
                  let timeString = "Unknown";
                  if (log.timestamp) {
                      try {
                          const d = new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z');
                          timeString = d.toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                          });
                      } catch(e) {}
                  }
                  
                  return (
                    <tr key={log.id || log._id || Math.random()} className="hover:bg-soc-bg/60 cursor-pointer transition-colors">
                      <td className="px-6 py-4 text-soc-muted font-mono text-xs whitespace-nowrap">{timeString}</td>
                      <td className="px-6 py-4 text-blue-400 font-mono text-xs">{log.ip_address || '-'}</td>
                      <td className="px-6 py-4 font-bold text-soc-text">{log.details?.host || log.details?.Computer || '-'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-soc-muted">
                        <span className="bg-soc-bg px-2 py-1 rounded border border-soc-border/50">{log.process_name || '-'}</span>
                      </td>
                      <td className="px-6 py-4 flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-soc-border flex items-center justify-center text-[10px] font-bold">
                           {(log.user && log.user !== 'Unknown' && log.user !== 'System') ? log.user.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span>{log.user || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold bg-soc-bg border
                          ${log.severity?.toLowerCase() === 'high' || log.severity?.toLowerCase() === 'critical' ? 'text-soc-danger border-soc-danger/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 
                            log.severity?.toLowerCase() === 'medium' ? 'text-soc-warning border-soc-warning/50' : 'text-soc-success border-soc-success/30'}`}>
                          {log.severity ? log.severity.toUpperCase() : 'LOW'}
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

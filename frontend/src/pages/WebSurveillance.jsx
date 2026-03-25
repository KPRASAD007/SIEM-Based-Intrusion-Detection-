import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, Globe, Activity, RefreshCw, Search, Server } from 'lucide-react';

export default function WebSurveillance() {
  const [webLogs, setWebLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWebLogs = () => {
    setLoading(true);
    fetch(`http://${window.location.hostname}:8080/api/logs`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(l => l.event_type === "Web Traffic" || l.event_id === "DNS-WEB");
        setWebLogs(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching web logs:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWebLogs();
  }, []);

  const displayLogs = webLogs.filter(log => {
      if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const d = (log.details?.domain || log.command_line || '').toLowerCase();
          const u = (log.user || '').toLowerCase();
          return d.includes(q) || u.includes(q);
      }
      return true;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center">
            <Eye size={36} className="mr-4 text-soc-primary animate-pulse" /> WEB_TRANSIT_INTEL
          </h2>
          <p className="text-[10px] font-bold text-soc-muted tracking-[0.4em] mt-3">LIVE DNS INTERCEPTION & BROWSER NAVIGATION TRACKING_V1.2</p>
        </div>
        <button 
          onClick={fetchWebLogs} 
          className="px-8 py-3.5 bg-soc-panel/60 border-2 border-soc-border text-white rounded-xl hover:border-soc-primary hover:text-soc-primary transition-all text-xs font-black uppercase tracking-widest italic flex items-center shadow-xl group"
        >
          <RefreshCw size={18} className={`mr-3 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} /> SYNC_TRAFFIC_FEED
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border rounded-[2.5rem] p-8 shadow-2xl flex items-center justify-between group relative overflow-hidden">
            <div className="absolute inset-0 bg-soc-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center space-x-6 relative z-10">
                <div className="p-5 bg-soc-primary/10 border-2 border-soc-primary/20 rounded-3xl text-soc-primary shadow-lg group-hover:scale-110 transition-transform">
                    <Globe size={32} />
                </div>
                <div>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter">{webLogs.length.toString().padStart(2, '0')}</h3>
                    <p className="text-[10px] text-soc-muted font-black uppercase tracking-widest opacity-60">DOMAINS_INTERCEPTED</p>
                </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity pointer-events-none">
                <Globe size={120} />
            </div>
        </div>

        <div className="lg:col-span-2 bg-soc-bg border-2 border-soc-border rounded-[2.5rem] p-6 flex items-center shadow-2xl">
           <div className="bg-soc-panel/50 border-2 border-soc-border rounded-2xl flex items-center px-6 py-4 w-full focus-within:border-soc-primary transition-all group/search shadow-xl">
             <Search size={20} className="text-soc-muted mr-5 group-focus-within/search:text-soc-primary transition-colors" />
             <input 
               type="text" 
               placeholder="IDENTIFY_DOMAIN_OR_IDENTITY_STRING..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-transparent border-none text-sm font-black text-white w-full outline-none placeholder:text-soc-muted/30 uppercase italic"
             />
           </div>
        </div>
      </div>

      <div className="bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="p-10 border-b-2 border-soc-border bg-soc-bg/40 relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-soc-primary shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center">
              <Activity size={24} className="mr-4 text-soc-primary" /> NAVIGATION_SIGNAL_ARRAY
            </h3>
            <p className="text-[9px] font-bold text-soc-muted tracking-[0.4em] uppercase mt-2 opacity-40">REAL_TIME_DECRYPTED_TRAFFIC_ANALYSIS</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0b0e14]/50 text-soc-muted border-b border-soc-border text-[9px] font-black uppercase tracking-[0.2em] italic">
              <tr>
                <th className="px-10 py-6">TELEMETRY_STAMP</th>
                <th className="px-10 py-6">SOURCE_NOD_ID</th>
                <th className="px-10 py-6">REQUESTED_NAMESPACE_URI</th>
                <th className="px-10 py-6 text-right">SIGNAL_PROTO_ORIGIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border">
              {loading ? (
                <tr><td colSpan="4" className="px-10 py-32 text-center bg-soc-bg/20">
                   <div className="flex flex-col items-center space-y-4">
                      <div className="w-10 h-10 border-4 border-soc-primary/20 border-t-soc-primary rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-soc-primary uppercase tracking-[0.3em] animate-pulse">DECRYPTING_SIGNAL_BURSTS...</p>
                   </div>
                </td></tr>
              ) : displayLogs.length === 0 ? (
                <tr><td colSpan="4" className="px-10 py-40 text-center bg-soc-bg/20">
                  <div className="flex flex-col items-center space-y-6 opacity-30">
                    <Eye size={80} className="text-soc-muted animate-pulse" />
                    <div className="space-y-2">
                       <p className="text-3xl font-black text-white italic tracking-tighter uppercase">ZERO_TRAFFIC_INTERCEPTED</p>
                       <p className="text-[10px] text-soc-muted font-bold tracking-[0.3em] uppercase">WAITING_FOR_REMOTE_BROWSER_HANDSHAKE</p>
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
                  
                  const domain = log.details?.domain || (log.command_line ? log.command_line.replace("DNS Lookup: ", "") : "UNRESOLVED_DOMAIN");
                  
                  return (
                    <tr key={log.id || log._id} className="hover:bg-soc-primary/[0.03] group transition-all duration-300">
                      <td className="px-10 py-5 text-soc-muted font-mono text-[10px] uppercase tracking-tighter italic">{timeString}</td>
                      <td className="px-10 py-5">
                        <div className="flex items-center space-x-4">
                           <div className="w-8 h-8 rounded-2xl bg-soc-panel border-2 border-soc-border flex items-center justify-center text-soc-muted group-hover:border-soc-primary group-hover:text-soc-primary transition-all">
                              <Server size={14} />
                           </div>
                           <span className="text-[11px] font-black text-white italic tracking-widest uppercase opacity-80 group-hover:opacity-100">{log.details?.host || log.user || 'SYSTEM_NODE'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-5">
                         <div className="flex items-center bg-soc-bg/50 px-4 py-2 rounded-2xl border border-soc-border group-hover:border-soc-primary/30 transition-all">
                            <span className="w-2 h-2 rounded-full bg-soc-primary mr-4 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                            <span className="text-xs font-mono text-soc-primary font-black tracking-tight">{domain}</span>
                         </div>
                      </td>
                      <td className="px-10 py-5 text-right font-black text-[9px] text-soc-muted uppercase tracking-[0.3em] italic">DNS_OVER_LOCAL_V2</td>
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

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soc-text flex items-center">
            <Eye size={28} className="mr-3 text-soc-primary" /> Web Surveillance
          </h2>
          <p className="text-sm text-soc-muted mt-1">Live DNS & Browser Navigation Tracking across network endpoints</p>
        </div>
        <button onClick={fetchWebLogs} className="flex items-center px-4 py-2 bg-soc-panel border border-soc-border rounded hover:border-soc-primary hover:text-soc-primary transition-colors text-sm shadow-lg">
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Traffic
        </button>
      </div>

      <div className="bg-soc-panel border border-soc-border rounded-lg p-6 shadow-lg mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
              <div className="p-3 bg-soc-bg border border-soc-border rounded-lg shadow-inner">
                  <Globe size={28} className="text-soc-primary" />
              </div>
              <div>
                  <h3 className="text-xl font-bold text-soc-text">{webLogs.length}</h3>
                  <p className="text-xs text-soc-muted uppercase tracking-wider">Websites Intercepted</p>
              </div>
          </div>
          <div className="flex items-center bg-soc-bg px-3 py-2 rounded border border-soc-border focus-within:border-soc-primary transition-colors w-64">
            <Search size={14} className="text-soc-muted mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search domains or users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm text-soc-text w-full outline-none placeholder-soc-muted"
            />
          </div>
      </div>

      <div className="bg-soc-panel border border-soc-border rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 border-b border-soc-border bg-gradient-to-r from-soc-bg to-soc-panel flex items-center justify-between">
            <h3 className="font-bold text-soc-text flex items-center shrink-0">
              <Activity size={18} className="mr-2 text-soc-primary" /> Intercepted Navigation Stream
            </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0B0E14] text-soc-muted border-b border-soc-border text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Network Time</th>
                <th className="px-6 py-4 font-bold">Remote Host</th>
                <th className="px-6 py-4 font-bold">Requested Domain / URL</th>
                <th className="px-6 py-4 font-bold">Browser Fingerprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-soc-muted bg-soc-bg/30">Decrypting network traffic...</td></tr>
              ) : displayLogs.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-soc-muted bg-soc-bg/30">
                  <Eye size={48} className="mx-auto mb-4 opacity-20" />
                  No Web Traffic logs found. Ask the remote user to browse the web!
                </td></tr>
              ) : (
                displayLogs.map(log => {
                  let timeString = "Unknown";
                  if (log.timestamp) {
                      try {
                          const d = new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z');
                          timeString = d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      } catch(e) {}
                  }
                  
                  const domain = log.details?.domain || (log.command_line ? log.command_line.replace("DNS Lookup: ", "") : "Unknown");
                  
                  return (
                    <tr key={log.id || log._id} className="hover:bg-soc-bg/60 cursor-pointer transition-colors group">
                      <td className="px-6 py-3 text-soc-muted font-mono text-xs whitespace-nowrap">{timeString}</td>
                      <td className="px-6 py-3 font-bold text-soc-text">
                        <span className="flex items-center"><Server size={14} className="mr-2 text-soc-muted" />{log.details?.host || log.user || '-'}</span>
                      </td>
                      <td className="px-6 py-3 text-soc-text font-mono">
                         <div className="flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-soc-success mr-2 group-hover:scale-150 transition-transform"></span>
                            {domain}
                         </div>
                      </td>
                      <td className="px-6 py-3 text-soc-muted text-xs">DNS-Over-Local Engine</td>
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

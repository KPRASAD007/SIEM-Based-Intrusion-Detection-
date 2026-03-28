import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Database, X, Globe, Activity, Scan } from 'lucide-react';

export default function LogManagement() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [enriching, setEnriching] = useState(false);
  const [intel, setIntel] = useState(null);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('raw'); // 'raw' or 'stats'
  const [statsData, setStatsData] = useState([]);

  const fetchLogs = (searchQuery = '') => {
    setLoading(true);
    let url = `http://${window.location.hostname}:8080/api/logs`;
    
    // Simple Splunk-style pipe detection
    if (searchQuery) {
      if (searchQuery.includes('| stats')) {
        const fieldMatch = searchQuery.match(/by\s+(\w+)/);
        const field = fieldMatch ? fieldMatch[1] : 'ip_address';
        url = `http://${window.location.hostname}:8080/api/search/stats?query=${encodeURIComponent(searchQuery.split('|')[0].trim())}&field=${field}`;
        setViewMode('stats');
      } else {
        url = `http://${window.location.hostname}:8080/api/search?query=${encodeURIComponent(searchQuery)}`;
        setViewMode('raw');
      }
    } else {
      setViewMode('raw');
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (searchQuery.includes('| stats')) {
          setStatsData(data);
        } else {
          setLogs(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const exportLogsToJSON = () => {
    if (logs.length === 0) return;
    const jsonString = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soc_logs_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-6">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center">
             <Database className="mr-3 text-soc-primary" /> LOG_ANALYZER_V2
           </h2>
           <p className="text-[10px] font-bold text-soc-muted tracking-[0.3em] mt-2">MULTIDIMENSIONAL SECURITY TELEMETRY EXPLORER</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={fetchLogs} className="flex items-center px-4 py-2.5 bg-soc-panel/60 border border-soc-border rounded-xl hover:border-soc-primary hover:text-soc-primary hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all text-xs font-bold uppercase tracking-widest">
            <RefreshCw size={14} className={`mr-2.5 ${loading ? 'animate-spin' : ''}`} /> Sync_Nodes
          </button>
          
          <button 
            onClick={exportLogsToJSON}
            disabled={logs.length === 0}
            className={`flex items-center px-6 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest shadow-xl border ${logs.length === 0 ? 'bg-soc-bg border-soc-border text-soc-muted cursor-not-allowed opacity-30' : 'bg-soc-primary border-soc-primary/20 text-soc-bg hover:bg-soc-hacker hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]'}`}
          >
            <Download size={14} className="mr-2.5" /> Data_Export
          </button>
        </div>
      </div>

      <div className="bg-soc-panel/30 backdrop-blur-xl border border-soc-border rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-soc-primary via-soc-secondary to-accent opacity-30"></div>
        
        <div className="p-6 border-b border-soc-border/50 flex items-center bg-soc-bg/40 group">
          <div className="flex items-center flex-1">
            <Search size={18} className="text-soc-primary group-focus-within:animate-pulse transition-all mr-4" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchLogs(query); }}
              placeholder="FILTER_STREAM: Enter host, process, or SPL: index=* ' Failed SSH' | stats count by ip_address" 
              className="w-full bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-soc-muted/40 uppercase tracking-widest"
            />
          </div>
          {viewMode === 'stats' && (
            <button 
              onClick={() => { setQuery(''); setViewMode('raw'); fetchLogs(); }}
              className="text-[10px] font-black text-soc-critical hover:text-white transition-all uppercase px-4"
            >
              Clear_Stats_View [X]
            </button>
          )}
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          {viewMode === 'stats' ? (
            <div className="p-10 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center mb-8">
                  <Activity className="text-soc-secondary mr-4" />
                  <div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Aggregation_Results</h3>
                    <p className="text-[9px] font-bold text-soc-muted tracking-[0.2em] mt-1 italic">TOP_RESULTS_BY_COUNT_METRIC</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {statsData.map((stat, idx) => (
                   <div key={idx} className="bg-soc-bg/60 border border-soc-border rounded-2xl p-6 hover:border-soc-secondary transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-mono text-soc-muted uppercase">Entity_Identifier</span>
                        <span className="px-2 py-1 bg-soc-secondary/10 text-soc-secondary text-[10px] font-black rounded border border-soc-secondary/20 tracking-tighter">SCORE_RANK: #{idx+1}</span>
                     </div>
                     <p className="text-lg font-black text-white font-mono break-all group-hover:text-soc-secondary transition-colors">{stat.value || 'N/A'}</p>
                     <div className="mt-6 flex items-end justify-between">
                        <div className="h-2 flex-1 bg-soc-border rounded-full mr-6 overflow-hidden">
                           <div className="h-full bg-soc-secondary" style={{ width: `${Math.min(100, (stat.count / statsData[0]?.count) * 100)}%` }}></div>
                        </div>
                        <span className="text-2xl font-black text-soc-secondary italic">{stat.count} <span className="text-[10px] font-bold text-soc-muted uppercase not-italic">HITs</span></span>
                     </div>
                   </div>
                 ))}
                 {statsData.length === 0 && (
                   <p className="col-span-full text-center py-10 text-soc-muted italic uppercase text-xs">NO_STATISTICAL_MATCHES_FOUND</p>
                 )}
               </div>
            </div>
          ) : (
            <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
              <thead className="bg-soc-bg/80 text-soc-primary uppercase tracking-widest border-b border-soc-border">
                <tr>
                  <th className="px-6 py-5 font-black italic">Timestamp_UTC</th>
                  <th className="px-6 py-5 font-black italic">ID</th>
                  <th className="px-6 py-5 font-black italic">Target_Host</th>
                  <th className="px-6 py-5 font-black italic">Process_ID</th>
                  <th className="px-6 py-5 font-black italic">Subject</th>
                  <th className="px-6 py-5 font-black italic">Vector_IP</th>
                  <th className="px-6 py-5 font-black italic">Classification</th>
                  <th className="px-6 py-5 font-black italic">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soc-border/30 bg-soc-bg/20">
                {loading ? (
                  <tr><td colSpan="8" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-soc-primary/10 border-t-soc-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-bold text-soc-primary tracking-[0.4em] uppercase animate-pulse">Initializing_Data_Payload...</p>
                    </div>
                  </td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-24 text-center font-mono opacity-40 uppercase tracking-widest italic text-xs">NO_EVENTS_REGISTERED_IN_BUFFER</td></tr>
                ) : (
                  logs.map(log => {
                    const timeStr = log.timestamp ? log.timestamp : new Date().toISOString();
                    const d = new Date(timeStr.endsWith('Z') ? timeStr : timeStr + 'Z');
                    const timeString = d.toLocaleString(undefined, { 
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                      year: 'numeric', month: '2-digit', day: '2-digit'
                    }).replace(',', '');
                    
                    return (
                      <tr 
                        key={log.id} 
                        onClick={() => { setSelectedLog(log); setIntel(null); }}
                        className="hover:bg-soc-primary/5 cursor-pointer transition-all border-l-2 border-l-transparent hover:border-l-soc-primary"
                      >
                        <td className="px-6 py-4 text-soc-muted font-mono">{timeString}</td>
                        <td className="px-6 py-4 text-white font-mono">{log.event_id || '000'}</td>
                        <td className="px-6 py-4 font-black tracking-tight">{log.details?.host || log.details?.Computer || 'NULL'}</td>
                        <td className="px-6 py-4 font-mono text-soc-primary opacity-80">{log.process_name || '-'}</td>
                        <td className="px-6 py-4 font-bold">{log.user || '-'}</td>
                        <td className="px-6 py-4 text-soc-secondary font-mono bg-soc-secondary/5 border border-soc-secondary/10 rounded px-2 py-0.5 mx-1">{log.ip_address || '::1'}</td>
                        <td className="px-6 py-4 opacity-70 uppercase font-black text-[9px] tracking-widest">{log.event_type || 'GENERAL'}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                            ${(log.severity || '').toLowerCase() === 'critical' || (log.severity || '').toLowerCase() === 'high' ? 'bg-soc-critical/10 text-soc-critical border-soc-critical/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 
                              (log.severity || '').toLowerCase() === 'medium' ? 'bg-soc-warning/10 text-soc-warning border-soc-warning/40' : 
                              'bg-soc-primary/10 text-soc-primary border-soc-primary/40'}`}>
                            {log.severity ? log.severity.toUpperCase() : 'LOW_LEVEL'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-4 bg-soc-bg/80 border-t border-soc-border flex items-center justify-between">
           <div className="text-[9px] font-mono text-soc-muted uppercase flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-soc-primary mr-2"></div>
              Live // Total_Records: {logs.length}
           </div>
           <div className="flex items-center space-x-4 opacity-40">
              <div className="h-1 w-20 bg-soc-border rounded-full overflow-hidden">
                 <div className="h-full bg-soc-primary w-1/3"></div>
              </div>
              <span className="text-[8px] font-black text-white uppercase italic">Memory_Usage: 14%</span>
           </div>
        </div>
      </div>

      {/* Log Detail & Enrichment Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[200] bg-soc-bg/95 backdrop-blur-3xl flex items-center justify-center p-4 lg:p-12 animate-in fade-in zoom-in duration-300">
           <div className="bg-soc-panel border-2 border-soc-border rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 z-10">
                 <button onClick={() => setSelectedLog(null)} className="p-3 bg-soc-bg/80 border border-soc-border rounded-xl hover:border-white transition-all">
                    <X size={20} className="text-white" />
                 </button>
              </div>

              <div className="p-10 border-b-2 border-soc-border bg-soc-bg/40">
                 <p className="text-soc-primary font-black text-[10px] uppercase tracking-[0.4em] mb-2 italic">Detailed_Telemetry_Inspect</p>
                 <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{selectedLog.process_name || 'System_Event'}</h2>
                 <p className="text-[10px] text-soc-muted font-mono mt-1">UUID: {selectedLog.id} | SOURCE: {selectedLog.details?.host || 'Internal'}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-soc-muted uppercase tracking-widest italic">Signal_Vector</p>
                       <p className="text-lg font-black text-soc-secondary font-mono">{selectedLog.ip_address || '::1'}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-soc-muted uppercase tracking-widest italic">Payload_Digest</p>
                       <p className="text-sm font-bold text-white truncate px-4 py-2 bg-soc-bg rounded-lg border border-soc-border">{selectedLog.command_line || 'SHLRUN_INTERNAL'}</p>
                    </div>
                 </div>

                 <div className="bg-soc-bg/40 border border-soc-border rounded-2xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[11px] font-black text-white uppercase tracking-widest italic flex items-center">
                          <RefreshCw size={16} className={`mr-3 text-soc-primary ${enriching ? 'animate-spin' : ''}`} /> Cyber_Intel_Verification
                       </h4>
                       <button 
                          onClick={async () => {
                             if (!selectedLog.ip_address) return;
                             setEnriching(true);
                             try {
                                const res = await fetch(`http://${window.location.hostname}:8080/api/intel/lookup/${encodeURIComponent(selectedLog.ip_address)}`);
                                if (res.ok) setIntel(await res.json());
                             } catch(err) { console.error(err); }
                             setEnriching(false);
                          }}
                          disabled={enriching || !selectedLog.ip_address}
                          className="px-6 py-2 bg-soc-primary/10 text-soc-primary border border-soc-primary/30 rounded-xl hover:bg-soc-primary hover:text-soc-bg transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                       >
                          ENRICH_WITH_CYBER_INTEL
                       </button>
                    </div>

                    {intel ? (
                       <div className="grid grid-cols-2 gap-8 pt-4 border-t border-soc-border animate-in slide-in-from-top-4">
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-soc-muted uppercase">Verdict</p>
                             <p className={`text-xl font-black italic ${intel.verdict === 'CRITICAL RISK' ? 'text-soc-critical' : 'text-soc-warning'}`}>{intel.verdict}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-soc-muted uppercase">Global_Origin</p>
                             <p className="text-lg font-black text-white italic">{intel.geodata.city}, {intel.geodata.country}</p>
                          </div>
                       </div>
                    ) : (
                       <p className="text-[10px] text-soc-muted italic opacity-50 text-center py-4">NO_INTEL_ENRICHMENT_DATA_STREAMED. RUN_VERIFICATION_PROTOCOL ABOVE.</p>
                    )}
                 </div>

                 <div className="space-y-4">
                    <p className="text-[9px] font-black text-soc-muted uppercase tracking-widest italic">Raw_Telemetry_JSON</p>
                    <pre className="p-6 bg-black/40 border border-soc-border rounded-[1.5rem] font-mono text-[11px] text-soc-primary/80 overflow-x-auto">
                       {JSON.stringify(selectedLog, null, 2)}
                    </pre>
                 </div>
              </div>

              <div className="p-8 bg-soc-bg border-t border-soc-border flex items-center justify-end">
                 <button 
                   onClick={() => setSelectedLog(null)}
                   className="px-10 py-3 bg-soc-primary text-soc-bg rounded-xl text-xs font-black uppercase tracking-widest hover:bg-soc-hacker transition-all italic shadow-2xl"
                 >
                    CLOSE_COMMIT
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

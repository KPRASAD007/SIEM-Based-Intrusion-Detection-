import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, Activity, AlertCircle, FileText, Search, Filter } from 'lucide-react';
import { API_BASE_URL } from '../config';


export default function AuditVault() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('siem_token');

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/audit-logs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error("Failed to fetch audit vault", err);
      }
      setLoading(false);
    };
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.target && log.target.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActionColor = (action) => {
    if (action.includes('DELETED') || action.includes('LOCKOUT')) return 'text-soc-critical';
    if (action.includes('REGISTERED') || action.includes('INITIALIZED')) return 'text-soc-primary';
    return 'text-soc-secondary';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-2 border-soc-primary/20 pb-8 relative z-10">
        <div className="absolute -bottom-[2px] left-0 w-32 h-[2px] bg-soc-primary shadow-[0_0_15px_rgba(0,243,255,0.8)]"></div>
        <div>
           <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-soc-primary to-soc-bg tracking-[0.2em] uppercase italic flex items-center">
             <Shield className="mr-4 text-soc-primary drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]" size={36} /> AUDIT_VAULT
           </h2>
           <p className="text-[10px] font-bold text-soc-secondary tracking-[0.4em] mt-3 flex items-center italic">
             <span className="w-2 h-2 bg-soc-primary rounded-full inline-block mr-2 animate-pulse"></span> SYSTEM INTEGRITY AND ANALYST OVERVIEW
           </p>
        </div>

        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soc-muted group-focus-within:text-soc-primary transition-colors" size={18} />
           <input 
             type="text"
             placeholder="FILTER_VAULT_RECORDS..."
             className="bg-soc-panel/30 border border-soc-border rounded-2xl py-4 pl-12 pr-6 text-xs font-black text-white w-full lg:w-80 focus:outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/30"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-soc-panel/20 backdrop-blur-3xl border border-soc-border rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-soc-border bg-soc-primary/5">
                <th className="px-8 py-6 text-[10px] font-black text-soc-primary uppercase tracking-[0.3em] italic">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-soc-primary uppercase tracking-[0.3em] italic">Operator (Actor)</th>
                <th className="px-8 py-6 text-[10px] font-black text-soc-primary uppercase tracking-[0.3em] italic">Action_Sequence</th>
                <th className="px-8 py-6 text-[10px] font-black text-soc-primary uppercase tracking-[0.3em] italic">Target/Object</th>
                <th className="px-8 py-6 text-[10px] font-black text-soc-primary uppercase tracking-[0.3em] italic text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                       <div className="w-10 h-10 border-4 border-soc-primary/20 border-t-soc-primary rounded-full animate-spin mb-4"></div>
                       <p className="text-[10px] font-black text-soc-muted uppercase tracking-widest">Decrypting_Vault_History...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-soc-muted text-xs font-black uppercase tracking-widest">
                    No matching integrity records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-soc-primary/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center text-[11px] font-bold text-white tracking-tighter italic">
                         <Clock size={14} className="mr-3 text-soc-secondary" />
                         {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-[11px] font-black text-soc-primary tracking-widest uppercase">
                         <User size={14} className="mr-3" /> {log.actor}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`text-[11px] font-black tracking-[0.1em] uppercase italic ${getActionColor(log.action)}`}>
                         {log.action.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[11px] font-medium text-soc-muted font-mono tracking-tight">
                         {log.target || log.details || 'SYSTEM_CORE'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="inline-flex items-center px-3 py-1 rounded-full bg-soc-primary/10 border border-soc-primary/20 text-[9px] font-black text-soc-primary tracking-widest uppercase">
                          <Shield size={10} className="mr-2" /> Verified
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Administrative Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Integrity Warning */}
          <div className="p-8 bg-soc-primary/5 border border-soc-primary/20 rounded-3xl flex flex-col justify-center">
             <div className="flex items-center space-x-4 mb-4">
                <Shield className="text-soc-primary" size={24} />
                <h4 className="text-xs font-black text-soc-primary uppercase tracking-widest italic">INTEGRITY_PROTOCOL</h4>
             </div>
             <p className="text-[10px] text-soc-muted font-medium tracking-tight leading-relaxed">
               All purge actions are cryptographically logged. Selective purging removes log telemetry but preserves the Audit Vault's own history for compliance.
             </p>
          </div>

          {/* Option 1: Selective Purge */}
          <div className="p-8 bg-soc-secondary/5 border border-soc-secondary/30 rounded-3xl flex flex-col justify-between relative group">
             <div>
                <h4 className="text-[10px] font-black text-soc-secondary uppercase tracking-[0.2em] mb-4">01 // SELECTIVE_HOST_PURGE</h4>
                <div className="space-y-4 mb-6 relative z-10">
                   <input 
                     type="text" 
                     id="purgeHost"
                     placeholder="ENTER_HOSTNAME_TO_WIPE" 
                     className="w-full bg-black/40 border border-soc-secondary/30 rounded-lg py-3 px-4 text-[10px] text-white focus:outline-none focus:border-soc-secondary transition-all font-mono"
                   />
                </div>
             </div>

             <button 
                onClick={async () => {
                  const targetHost = document.getElementById('purgeHost').value;
                  if (!targetHost) return alert("Please enter a hostname for selective purge.");
                  
                  if (window.confirm(`Surgical Strike: Purge all records for ${targetHost}?`)) {
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/logs/purge`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ hostname: targetHost })
                      });
                      const data = await res.json();
                      alert(`Surgical Purge Complete. Removed ${data.deleted_count} records.`);
                      window.location.reload();
                    } catch (e) { alert("Purge Failed."); }
                  }
                }}
                className="w-full py-4 border border-soc-secondary text-soc-secondary font-black uppercase tracking-[0.2em] rounded-xl hover:bg-soc-secondary hover:text-soc-bg transition-all text-[9px]"
             >
                PURGE_SPECIFIC_HOST
             </button>
          </div>

          {/* Option 2: Complete Purge */}
          <div className="p-8 bg-soc-critical/10 border-2 border-soc-critical/40 rounded-3xl flex flex-col justify-between relative group overflow-hidden">
             <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform">
                <Activity size={120} className="text-soc-critical" />
             </div>
             
             <div>
                <h4 className="text-[10px] font-black text-soc-critical uppercase tracking-[0.2em] mb-2 animate-pulse">02 // COMPLETE_SYSTEM_WIPE</h4>
                <p className="text-[9px] text-soc-critical/70 uppercase font-bold tracking-tighter mb-6 italic">Warning: This clears Logs, Alerts, and Incidents globally.</p>
             </div>

             <button 
                onClick={async () => {
                  if (window.confirm("NUCLEAR OPTION: Wipe ALL telemetry data? This cannot be reversed.")) {
                    if (window.confirm("FINAL_AUTHORIZATION: Confirm global data destruction?")) {
                       try {
                         const res = await fetch(`${API_BASE_URL}/api/logs/purge`, {
                           method: 'POST',
                           headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                           body: JSON.stringify({}) // Full wipe
                         });
                         alert("Full System Purge Complete.");
                         window.location.reload();
                       } catch (e) { alert("Purge Failed."); }
                    }
                  }
                }}
                className="w-full py-4 bg-soc-critical text-soc-bg font-black uppercase tracking-[0.3em] rounded-xl hover:bg-white hover:text-soc-critical transition-all text-[9px] shadow-[0_0_30px_rgba(239,68,68,0.3)] relative z-10"
             >
                INITIALIZE_GLOBAL_WIPE
             </button>
          </div>
      </div>
    </div>
  );
}

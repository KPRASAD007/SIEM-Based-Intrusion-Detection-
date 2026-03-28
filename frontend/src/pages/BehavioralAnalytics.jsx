import React, { useState, useEffect } from 'react';
import { Fingerprint, TrendingUp, AlertCircle, Activity, ShieldCheck, UserCheck, ShieldAlert, BarChart3, ListFilter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BehavioralAnalytics() {
  const [profiles, setProfiles] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, anomaliesRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:8080/api/behavior/profiles`),
        fetch(`http://${window.location.hostname}:8080/api/behavior/anomalies`)
      ]);
      const profilesData = await profilesRes.json();
      const anomaliesData = await anomaliesRes.json();
      setProfiles(Array.isArray(profilesData) ? profilesData : []);
      setAnomalies(Array.isArray(anomaliesData) ? anomaliesData : []);
    } catch (e) {
      console.error("Failed to fetch behavior data", e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 text-white">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center">
            <Fingerprint className="mr-4 text-soc-secondary animate-pulse" size={36} /> UEBA_ANALYTICS_V2.0
          </h2>
          <p className="text-[10px] font-bold text-soc-muted tracking-[0.4em] mt-3">PROFILING ENTITY BEHAVIOR & DETECTING STATISTICAL DEVIATION ANOMALIES</p>
        </div>
        <div className="flex space-x-4">
           <div className="hidden sm:flex items-center space-x-4 bg-soc-bg border-2 border-soc-border px-6 py-3 rounded-2xl shadow-xl">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-soc-secondary text-center tracking-tight">{profiles.length}</span>
                  <span className="text-[7px] font-black text-soc-muted text-center uppercase tracking-widest mt-1">PROFILED_SUBJECTS</span>
               </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Anomaly Stream */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden h-[700px] flex flex-col">
              <h3 className="text-sm font-black text-white italic tracking-widest uppercase mb-8 flex items-center shrink-0">
                <AlertCircle className="mr-3 text-soc-secondary" size={20} /> LIVE_DEVIATION_STREAM
              </h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                 {loading ? (
                   <div className="py-20 text-center animate-pulse text-soc-muted font-black text-[10px] uppercase tracking-[0.3em]">PROCESSING_ANOMALY_BUFFERS...</div>
                 ) : anomalies.length === 0 ? (
                   <div className="py-20 text-center opacity-30 text-soc-muted font-black text-[10px] uppercase tracking-[0.3em]">NO_DEVIATIONS_DETECTED</div>
                 ) : anomalies.map((anomaly, idx) => (
                   <div key={idx} className={`p-5 bg-soc-bg border-2 border-soc-border rounded-2xl transition-all relative overflow-hidden hover:scale-[1.02] 
                      ${anomaly.severity === 'critical' ? 'border-soc-critical shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'hover:border-soc-secondary'}`}>
                      <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center space-x-3">
                            <ShieldAlert size={14} className={anomaly.severity === 'critical' ? 'text-soc-critical' : 'text-soc-secondary'} />
                            <span className="text-[9px] font-black text-white uppercase italic truncate max-w-[120px]">{anomaly.user}</span>
                         </div>
                         <span className="text-[8px] font-mono text-soc-muted uppercase italic">{anomaly.timestamp}</span>
                      </div>
                      <div className={`text-[8px] font-black uppercase tracking-widest mb-2 ${anomaly.severity === 'critical' ? 'text-soc-critical' : 'text-soc-secondary'}`}>
                         [{anomaly.type.replace('_', ' ')}]
                      </div>
                      <p className="text-[10px] text-soc-muted font-bold tracking-tight leading-relaxed uppercase opacity-80">{anomaly.description}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* User Profile Deep Dive */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
              <h3 className="text-sm font-black text-white italic tracking-widest uppercase mb-10 flex items-center">
                <UserCheck className="mr-3 text-soc-secondary" size={20} /> SUBJECT_ACTIVITY_PROFILES
              </h3>
              
              <div className="space-y-10">
                 {profiles.map(profile => (
                   <div key={profile.user} className="bg-soc-bg rounded-[2rem] border-2 border-soc-border p-8 relative group overflow-hidden transition-all hover:border-soc-secondary/50">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                         <TrendingUp size={120} />
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 relative z-10">
                         <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 rounded-[1.2rem] bg-soc-panel border-2 border-soc-border flex items-center justify-center shadow-2xl group-hover:border-soc-secondary transition-all">
                               <Fingerprint size={32} className="text-soc-secondary" />
                            </div>
                            <div>
                               <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">{profile.user}</h4>
                               <div className="flex items-center space-x-4 mt-2">
                                  <div className="flex items-center text-[9px] font-black text-soc-muted uppercase tracking-widest">
                                     <Activity size={12} className="mr-2" /> SEEN: {profile.last_seen}
                                  </div>
                                  <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${profile.risk_score > 70 ? 'bg-soc-critical/10 text-soc-critical border-soc-critical/30' : 'bg-soc-secondary/10 text-soc-secondary border-soc-secondary/30'}`}>
                                     RISK_SCORE: {profile.risk_score}
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="w-full md:w-64 h-24">
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={profile.daily_actions.map((val, i) => ({ val, i }))}>
                                  <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                     {profile.daily_actions.map((_, i) => (
                                        <Cell key={i} fill={i === profile.daily_actions.length - 1 ? "#06b6d4" : "rgba(6,182,212,0.1)"} />
                                     ))}
                                  </Bar>
                               </BarChart>
                            </ResponsiveContainer>
                            <p className="text-[8px] text-center font-black text-soc-muted uppercase tracking-widest mt-2">7_DAY_ACTIVITY_BASELINE</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                         <div className="space-y-4">
                            <h5 className="text-[9px] font-black text-soc-secondary uppercase tracking-[0.3em] flex items-center italic">
                               <ListFilter size={14} className="mr-2" /> COMMAND_HISTOGRAM
                            </h5>
                            <div className="flex flex-wrap gap-3">
                               {profile.top_commands.map(cmd => (
                                  <span key={cmd} className="px-4 py-2 bg-soc-panel border-2 border-soc-border rounded-xl text-[10px] font-mono font-black italic hover:border-soc-secondary transition-all cursor-crosshair">
                                     {cmd.toUpperCase()}
                                  </span>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-4 flex flex-col justify-end items-end">
                            <button className="px-8 py-3 bg-soc-secondary text-soc-bg rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:scale-105 transition-all shadow-glow">
                               INVESTIGATE_ENTITY
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

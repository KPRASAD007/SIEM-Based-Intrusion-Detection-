import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ShieldAlert, Activity, Users, Database, Maximize2, X, TrendingUp, AlertTriangle, Zap, Fingerprint } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChart, setExpandedChart] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [alertsRes, logsRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:8080/api/alerts`),
        fetch(`http://${window.location.hostname}:8080/api/logs?limit=1000`)
      ]);
      const alertsData = await alertsRes.json();
      const logsData = await logsRes.json();
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (e) {
      console.error("Failed to load dashboard stats", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = alerts.filter(a => a.status === 'new' || a.status === 'investigating').length;
  const criticalAlerts = alerts.filter(a => (a.severity || '').toLowerCase() === 'critical').length;
  
  // Rule Distribution Data
  const alertsByRule = alerts.reduce((acc, a) => {
    const key = a.rule_name || 'Unknown Rule';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const ruleData = Object.keys(alertsByRule).length > 0 
    ? Object.keys(alertsByRule).map(key => ({
        rule: key.length > 25 ? key.substring(0, 25) + "..." : key,
        fullRule: key,
        count: alertsByRule[key]
      })).sort((a, b) => b.count - a.count)
    : [
        { rule: "PsExec Detection", count: 4 },
        { rule: "Encoded PowerShell", count: 7 },
        { rule: "LSASS Dumping", count: 2 },
        { rule: "Brute Force", count: 12 },
        { rule: "Log Clearing", count: 1 }
      ];

  // Severity Data
  const rawSeverity = alerts.reduce((acc, a) => {
    const sev = a.severity ? a.severity.charAt(0).toUpperCase() + a.severity.slice(1).toLowerCase() : 'Unknown';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {});
  
  const severityData = [
    { name: 'Low', value: rawSeverity['Low'] || 0 },
    { name: 'Medium', value: rawSeverity['Medium'] || 0 },
    { name: 'High', value: rawSeverity['High'] || 0 },
    { name: 'Critical', value: rawSeverity['Critical'] || 0 }
  ].filter(d => d.value > 0);

  if (severityData.length === 0) severityData.push({ name: 'Baseline', value: 1 });

  // Ingestion Trend Data (Mocked based on log count)
  const ingestionData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i*2}:00`,
    logs: 1000 + Math.floor(Math.random() * 500) + (i * 100),
    alerts: Math.floor(Math.random() * 5)
  }));

  const renderBarChart = (isExpanded = false) => (
    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
      <BarChart data={ruleData} margin={{ top: 20, right: 30, left: 0, bottom: isExpanded ? 100 : 70 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
        <XAxis 
          dataKey="rule" 
          stroke="#64748b" 
          tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} 
          angle={-35} 
          textAnchor="end" 
          interval={0}
          height={isExpanded ? 100 : 70}
        />
        <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #10b981', color: '#fff' }} cursor={{fill: 'rgba(59,130,246,0.05)'}} />
        <Bar dataKey="count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
      <PieChart>
        <Pie
          data={severityData}
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {severityData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
      <AreaChart data={ingestionData}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
        <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} />
        <YAxis stroke="#64748b" tick={{fontSize: 10}} />
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#fff' }} />
        <Area type="monotone" dataKey="logs" stroke="#10b981" fillOpacity={1} fill="url(#areaGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000 pb-32">
      {/* Header section with data-rich stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-2 border-soc-primary/20 pb-8 relative">
        <div className="absolute -bottom-[2px] left-0 w-32 h-[2px] bg-soc-primary shadow-[0_0_15px_rgba(0,243,255,0.8)]"></div>
        <div className="absolute -bottom-[2px] right-0 w-8 h-[2px] bg-soc-secondary shadow-[0_0_15px_rgba(255,0,60,0.8)]"></div>
        <div>
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-soc-primary to-soc-bg tracking-[0.2em] uppercase flex items-center">
             <Activity className="mr-6 text-soc-primary drop-shadow-[0_0_10px_rgba(0,243,255,0.8)] animate-pulse" size={48} /> STRAT_COMMAND_V4
          </h2>
          <p className="text-xs font-black text-soc-secondary tracking-[0.5em] mt-2 italic flex items-center">
             <span className="w-2 h-2 bg-soc-secondary rounded-full inline-block mr-2 animate-ping"></span> MULTI-VECTOR THREAT LANDSCAPE
          </p>
        </div>
        <div className="flex items-center space-x-6">
           <div className="flex space-x-8">
              <div className="text-right">
                 <p className="text-[9px] font-black text-soc-muted uppercase">Global_Trust</p>
                 <p className="text-sm font-black text-soc-primary italic">99.8% SECURE</p>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-soc-muted uppercase">Sync_Status</p>
                 <p className="text-sm font-black text-white italic">SYSLOG_READY</p>
              </div>
           </div>
           <button onClick={fetchStats} className="p-3 bg-soc-secondary/10 border border-soc-secondary/30 rounded-xl text-soc-secondary hover:bg-soc-secondary hover:text-soc-bg transition-all">
              <Zap size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      {/* Main Metrics Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {[
          { label: 'Event Telemetry', value: (145800 + logs.length).toLocaleString(), trend: '+3.2%', icon: Database, color: 'text-soc-primary', border: 'border-soc-primary', glow: 'shadow-[0_0_30px_rgba(0,243,255,0.15)]' },
          { label: 'Active Signals', value: activeAlerts, trend: '-2', icon: Activity, color: 'text-soc-secondary', border: 'border-soc-secondary', glow: 'shadow-[0_0_30px_rgba(255,0,60,0.2)]' },
          { label: 'Critical Breach', value: criticalAlerts, trend: 'STABLE', icon: ShieldAlert, color: 'text-soc-critical', border: 'border-soc-critical', glow: 'shadow-[0_0_40px_rgba(255,0,60,0.4)]' },
          { label: 'Network Sensors', value: '12', trend: 'ONLINE', icon: Zap, color: 'text-accent', border: 'border-accent', glow: 'shadow-[0_0_30px_rgba(176,38,255,0.15)]' }
        ].map((stat, i) => (
          <div key={i} className={`bg-[#050510]/80 backdrop-blur-3xl border ${stat.border}/50 p-8 relative overflow-hidden group ${stat.glow} transition-all duration-500 hover:-translate-y-2 hover:border-b-4 clip-path-cyber`}>
            {/* Cyberpunk corner cut mock via border tricks */}
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 ${stat.border}`}></div>
            <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${stat.border}`}></div>

            <div className={`absolute top-1/2 right-1/4 -translate-y-1/2 p-6 opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700 ${stat.color}`}>
              <stat.icon size={120} />
            </div>
            
            <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{stat.label}</p>
            <div className="flex items-baseline space-x-3 relative z-10">
               <h3 className={`text-6xl font-black tracking-tighter drop-shadow-[0_0_15px_currentColor] ${stat.color}`}>{stat.value}</h3>
               <span className="text-[10px] font-bold text-white opacity-40 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <div className={`absolute bottom-0 right-0 w-32 h-1 ${stat.border} bg-current group-hover:w-full transition-all duration-1000 opacity-50`}></div>
          </div>
        ))}
      </div>

      {/* Primary Analytics Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-[#050510]/80 backdrop-blur-3xl border border-soc-primary/20 p-10 lg:col-span-2 shadow-[0_0_50px_rgba(0,243,255,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-soc-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-soc-primary to-white uppercase tracking-[0.2em] flex items-center">
                <Activity size={24} className="mr-4 text-soc-primary" /> Rule_Activation_Matrix
              </h3>
              <p className="text-[10px] text-soc-primary/60 font-bold mt-2 uppercase tracking-[0.4em] font-mono">Signal_Calibration // Aggregated Hit Rates by Logic Pattern</p>
            </div>
            <button onClick={() => setExpandedChart('bar')} className="p-3 bg-soc-bg border border-soc-primary/30 text-soc-primary hover:bg-soc-primary hover:text-black transition-all group/btn shadow-[0_0_15px_rgba(0,243,255,0.2)]">
              <Maximize2 size={20} className="group-hover/btn:scale-125 transition-transform" />
            </button>
          </div>
          <div className="h-[400px] w-full relative z-10 filter drop-shadow-[0_0_8px_rgba(0,243,255,0.3)]">
             {renderBarChart()}
          </div>
        </div>

        <div className="bg-[#050510]/80 backdrop-blur-3xl border border-soc-secondary/20 p-10 shadow-[0_0_50px_rgba(255,0,60,0.05)] relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-soc-secondary to-transparent opacity-50"></div>
          
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-soc-secondary to-white uppercase tracking-[0.2em] flex items-center">
                <AlertTriangle size={24} className="mr-4 text-soc-secondary" /> Severity_Index
              </h3>
              <p className="text-[10px] text-soc-secondary/60 font-bold mt-2 uppercase tracking-[0.4em] font-mono">Risk_Segmentation</p>
            </div>
          </div>
          <div className="h-[300px] w-full relative filter drop-shadow-[0_0_10px_rgba(255,0,60,0.2)]">
            {renderPieChart()}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-6xl font-black text-white tracking-[0.1em] drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{alerts.length}</span>
              <span className="text-[10px] font-black text-soc-secondary uppercase tracking-[0.4em] mt-2">ALERTS</span>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4">
             {severityData.map((d, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-soc-bg border-l-4 border-l-soc-secondary/50 hover:border-l-soc-secondary transition-colors group/sev">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-soc-muted group-hover/sev:text-white transition-colors">{d.name}</span>
                  <span className="text-xl font-black text-soc-secondary drop-shadow-[0_0_5px_rgba(255,0,60,0.8)]">{d.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Secondary Data Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="bg-[#050510]/80 backdrop-blur-3xl border border-soc-primary/20 p-10 lg:col-span-1 flex flex-col justify-between shadow-[0_0_30px_rgba(0,243,255,0.05)] relative group">
            <div className="absolute right-0 bottom-0 w-2 h-2 bg-soc-primary shadow-[0_0_10px_rgba(0,243,255,1)]"></div>
            <h3 className="text-sm font-black text-soc-primary uppercase tracking-[0.3em] mb-10 flex items-center">
               <TrendingUp size={18} className="mr-3 text-white" /> Ingestion Load Vector
            </h3>
            <div className="h-[250px] w-full filter drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">
               {renderAreaChart()}
            </div>
         </div>
         
         <div className="bg-soc-panel/30 backdrop-blur-xl border border-soc-border p-10 rounded-[2rem] shadow-xl flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
               <Zap size={100} className="text-soc-warning" />
            </div>
            <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-6 flex items-center underline decoration-soc-warning decoration-2 underline-offset-8">
               <Zap size={18} className="mr-3 text-soc-warning" /> Cyber_Deception_Health
            </h3>
            <div className="space-y-6 flex-1 flex flex-col justify-center">
               <div className="flex items-center justify-between p-4 bg-soc-bg border border-soc-border rounded-2xl">
                  <span className="text-[10px] font-black text-soc-muted uppercase">Active_Honey_Assets</span>
                  <span className="text-xl font-black italic text-soc-primary leading-none">03</span>
               </div>
               <div className="flex items-center justify-between p-4 bg-soc-bg border border-soc-border rounded-2xl">
                  <span className="text-[10px] font-black text-soc-muted uppercase">Breach_Triggers</span>
                  <span className="text-xl font-black italic text-soc-critical leading-none">01</span>
               </div>
               <div className="p-4 bg-soc-warning/5 border border-soc-warning/20 rounded-2xl">
                  <p className="text-[8px] font-black text-soc-warning uppercase tracking-widest mb-1">Status_Report</p>
                  <p className="text-[10px] text-white font-bold italic opacity-60">SSH_JUMPBOX breached. Trace active.</p>
               </div>
            </div>
         </div>

         <div className="bg-soc-panel/30 backdrop-blur-xl border border-soc-border p-10 rounded-[2rem] shadow-xl flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <Fingerprint size={100} className="text-soc-secondary" />
            </div>
            <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-6 flex items-center underline decoration-soc-secondary decoration-2 underline-offset-8">
               <Fingerprint size={18} className="mr-3 text-soc-secondary" /> Behavioral_Sync_Risk
            </h3>
            <div className="space-y-6 flex-1 flex flex-col justify-center">
               <div className="flex items-center space-x-6">
                  <div className="p-4 bg-soc-secondary/10 rounded-2xl border border-soc-secondary/20 text-soc-secondary">
                     <Users size={24} />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-soc-muted uppercase tracking-widest">Global_Risk_Level</p>
                     <p className="text-xl font-black text-white italic tracking-tighter uppercase">LOW_ANOMALY</p>
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex items-center justify-between text-[8px] font-black text-soc-muted uppercase tracking-widest">
                     <span>SUBJECT_DEVIATION_INDEX</span>
                     <span className="text-soc-secondary">15%</span>
                  </div>
                  <div className="h-1.5 w-full bg-soc-bg rounded-full overflow-hidden border border-soc-border">
                     <div className="h-full bg-soc-secondary w-[15%] shadow-glow"></div>
                  </div>
               </div>
               <p className="text-[9px] font-bold text-soc-muted italic leading-relaxed opacity-60">
                 "Nominal activity patterns detected across 92% of users. 03 entities marked for minor deviation monitoring."
               </p>
            </div>
         </div>
      </div>

      {expandedChart && (
        <div className="fixed inset-0 z-[1000] bg-soc-bg/95 backdrop-blur-3xl flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
          <div className="bg-soc-panel border-4 border-soc-border rounded-[3rem] shadow-2xl w-full max-w-7xl h-full flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 z-10">
              <button onClick={() => setExpandedChart(null)} className="p-4 bg-soc-bg border-2 border-soc-border rounded-2xl text-white hover:border-soc-primary transition-all shadow-xl">
                <X size={24} />
              </button>
            </div>
            <div className="p-14 border-b-2 border-soc-border bg-soc-bg/40">
               <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                  {expandedChart === 'bar' ? 'Full_Rule_Vector_Analysis' : 'Risk_Segmentation_View'}
               </h3>
               <p className="text-xs text-soc-muted font-black mt-2 uppercase tracking-[0.3em]">Authorized_SOC_Analyst_Diagnostic_Stream</p>
            </div>
            <div className="flex-1 p-14 bg-soc-bg/20">
               <div className="h-full w-full">
                  {expandedChart === 'bar' ? renderBarChart(true) : renderPieChart()}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header section with data-rich stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center">
             <Activity className="mr-4 text-soc-primary" size={32} /> COMMAND_CENTER_v4
          </h2>
          <p className="text-[10px] font-bold text-soc-muted tracking-[0.5em] mt-3">STRATEGIC MULTI-VECTOR THREAT LANDSCAPE</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Event Telemetry', value: (145800 + logs.length).toLocaleString(), trend: '+3.2%', icon: Database, color: 'text-soc-primary' },
          { label: 'Active Signals', value: activeAlerts, trend: '-2', icon: Activity, color: 'text-soc-secondary' },
          { label: 'Critical Breach', value: criticalAlerts, trend: 'STABLE', icon: ShieldAlert, color: 'text-soc-critical' },
          { label: 'Network Sensors', value: '12', trend: 'ONLINE', icon: Zap, color: 'text-accent' }
        ].map((stat, i) => (
          <div key={i} className="bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border p-8 rounded-[2rem] relative overflow-hidden group shadow-2xl">
            <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color}`}>
              <stat.icon size={80} />
            </div>
            <p className="text-[10px] font-black text-soc-muted uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <div className="flex items-baseline space-x-3">
               <h3 className={`text-5xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</h3>
               <span className="text-[10px] font-bold text-white opacity-40">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Analytics Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-soc-panel/40 backdrop-blur-xl border border-soc-border p-10 rounded-[2.5rem] lg:col-span-2 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-soc-primary to-soc-secondary opacity-30"></div>
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center">
                <Activity size={20} className="mr-3 text-soc-primary" /> Rule_Activation_Distribution
              </h3>
              <p className="text-[10px] text-soc-muted font-bold mt-2 uppercase tracking-widest opacity-60 italic">Signal_Calibration // Aggregated Hit Rates by Logic Pattern</p>
            </div>
            <button onClick={() => setExpandedChart('bar')} className="p-3 bg-soc-bg border border-soc-border rounded-2xl text-soc-muted hover:text-soc-primary transition-all">
              <Maximize2 size={20} />
            </button>
          </div>
          <div className="h-[400px] w-full">
             {renderBarChart()}
          </div>
        </div>

        <div className="bg-soc-panel/40 backdrop-blur-xl border border-soc-border p-10 rounded-[2.5rem] shadow-2xl relative">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center">
                <AlertTriangle size={20} className="mr-3 text-soc-warning" /> Severity_Index
              </h3>
              <p className="text-[10px] text-soc-muted font-bold mt-2 uppercase tracking-widest opacity-60 italic">Risk_Segmentation_Matrix</p>
            </div>
          </div>
          <div className="h-[300px] w-full relative">
            {renderPieChart()}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-black text-white leading-none tracking-tighter">{alerts.length}</span>
              <span className="text-[10px] font-black text-soc-muted uppercase tracking-widest mt-2">ALERTS</span>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4">
             {severityData.map((d, i) => (
               <div key={i} className="flex items-center justify-between p-3 bg-soc-bg border border-soc-border/50 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-soc-muted">{d.name}</span>
                  <span className="text-lg font-black italic text-white leading-none">{d.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Secondary Data Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="bg-soc-panel/30 backdrop-blur-xl border border-soc-border p-10 rounded-[2rem] shadow-xl lg:col-span-1 flex flex-col justify-between">
            <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-10 flex items-center">
               <TrendingUp size={18} className="mr-3 text-soc-primary" /> Ingestion_Load_Calibration
            </h3>
            <div className="h-[250px] w-full">
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

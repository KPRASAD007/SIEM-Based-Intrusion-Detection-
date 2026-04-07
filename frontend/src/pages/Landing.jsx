import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Activity, Database, Crosshair, ArrowRight, Zap, Orbit, Cpu, Network, Clock, Lock, Server, Globe2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [typedText, setTypedText] = useState('');
  const [stats, setStats] = useState(null);
  const [liveLogs, setLiveLogs] = useState([]);
  const fullText = "INITIALIZING CORE DEFENSE PROTOCOLS... ESTABLISHING SECURE CONNECTION TO SOC NETWORK... TELEMETRY STREAM ACQUIRED.";

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, 40);
    return () => clearInterval(typing);
  }, []);

  useEffect(() => {
    fetch(`http://127.0.0.1:8080/api/search/topology`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
      
    // Connect to Websocket for Live Terminal Streaming on Hero Page
    const ws = new WebSocket(`ws://127.0.0.1:8080/api/logs/ws`);

    ws.onmessage = (event) => {
        try {
           const payload = JSON.parse(event.data);
           if (payload.type === 'NEW_ALERT' || payload.type === 'NEW_LOG') {
               const msg = `[${new Date().toISOString()}] ${payload.data.rule_name || payload.data.event_id || 'TELEMETRY'} from IP ${payload.data.source_ip || payload.data.ip_address || 'SYS_KERNEL'}`;
               setLiveLogs(prev => [msg, ...prev].slice(0, 15));
           }
        } catch(e) {}
    };
    return () => ws.close();
  }, []);

  const getDefconColor = (level) => {
      switch(level) {
          case 1: return 'text-soc-critical border-soc-critical shadow-[0_0_20px_rgba(239,68,68,0.6)]';
          case 2: return 'text-soc-warning border-soc-warning shadow-[0_0_20px_rgba(245,158,11,0.6)]';
          case 3: return 'text-yellow-400 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]';
          case 4: return 'text-soc-primary border-soc-primary shadow-[0_0_20px_rgba(16,185,129,0.3)]';
          default: return 'text-soc-secondary border-soc-secondary shadow-[0_0_20px_rgba(59,130,246,0.3)]';
      }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 relative">
      {/* Background Neural Matrix Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-soc-primary/5 via-soc-secondary/5 to-soc-primary/5 animate-neural-pulse pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0"></div>

      {/* Hero Section */}
      <div className="relative border-y border-soc-primary/20 py-20 overflow-hidden bg-[#050510]/40 backdrop-blur-3xl z-10 w-full rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5),inset_0_0_50px_rgba(0,243,255,0.05)]">
        {/* Rotating Tactical HUD Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-soc-primary/10 rounded-full animate-hud-rotate pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-soc-secondary/5 rounded-full animate-[hud-rotate_30s_linear_infinite_reverse] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-soc-primary/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
           <div className="flex items-center space-x-4 bg-soc-bg/80 border border-soc-primary/30 p-2 pr-8 rounded-full shadow-[0_0_30px_rgba(0,243,255,0.1)]">
              <div className="w-12 h-12 rounded-full bg-soc-primary/20 border border-soc-primary flex items-center justify-center animate-pulse">
                 <Terminal size={22} className="text-soc-primary shadow-[0_0_10px_currentColor]" />
              </div>
              <span className="font-mono text-[11px] text-soc-primary uppercase tracking-[0.4em] font-black">{typedText}<span className="inline-block w-3 h-4 bg-soc-primary animate-ping ml-1 opacity-80"></span></span>
           </div>
           
           <h1 className="text-7xl md:text-9xl font-black text-white italic tracking-tighter uppercase leading-[0.8] animate-text-flicker">
              CYBER<span className="text-transparent bg-clip-text bg-gradient-to-r from-soc-primary via-white to-soc-secondary">DETECT</span>
              <br/>
              <span className="text-4xl md:text-5xl opacity-40">LAB_SYSTEM_v2</span>
           </h1>

           
           <p className="text-soc-muted text-sm tracking-[0.2em] uppercase font-mono max-w-3xl leading-relaxed">
             Next-Gen Security Information & Event Management (SIEM). Architected for Real-Time Threat Hunting, Zero-Trust Telemetry Ingestion, and Automated AI Defenses.
           </p>

           <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 pt-8">
             <Link to="/alerts" className="group relative flex items-center justify-center px-12 py-5 bg-soc-primary/10 border-2 border-soc-primary text-soc-primary hover:bg-soc-primary hover:text-white text-sm font-black uppercase tracking-[0.2em] italic rounded hover:scale-105 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] overflow-hidden">
               <span className="absolute w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[spin_1.5s_linear_infinite] opacity-50 pointer-events-none"></span>
               <Crosshair size={18} className="mr-3 relative z-10" /> <span className="relative z-10">Intercept Threats</span>
             </Link>
             <Link to="/dashboard" className="group flex items-center justify-center px-12 py-5 bg-soc-bg border border-soc-border text-soc-muted hover:text-white text-sm font-black uppercase tracking-[0.2em] italic rounded hover:border-soc-secondary transition-all shadow-2xl">
               <Activity size={18} className="mr-3 group-hover:text-soc-secondary group-hover:scale-125 transition-all" /> Enter Console
             </Link>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* DEFCON Rating & Health */}
        <div className="col-span-1 border border-soc-border bg-soc-panel/80 backdrop-blur-xl rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl relative group">
           <div className="p-8 pb-0">
             <h3 className="text-[12px] font-black text-soc-muted uppercase tracking-[0.3em] flex items-center mb-6">
                 <Shield size={16} className="mr-3 text-soc-secondary" /> System Posture Assessment
             </h3>
             <div className="flex justify-center mb-4">
                 <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center flex-col transition-all duration-1000 ${getDefconColor(stats?.defcon || 5)}`}>
                   <span className="text-4xl font-black italic tracking-tighter leading-none">{stats?.defcon || 5}</span>
                   <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">DEFCON</span>
                 </div>
             </div>
             <p className="text-center font-mono text-[10px] uppercase text-soc-muted tracking-widest mt-4">
                HEALTH_INTEGRITY: <span className="text-white font-black">{stats?.health_score || 100}%</span>
             </p>
           </div>
           
           <div className="mt-8 bg-soc-bg border-t border-soc-border p-4 grid grid-cols-2 divide-x divide-soc-border">
              <div className="text-center">
                 <p className="text-[9px] text-soc-muted font-bold uppercase tracking-widest mb-1">Critical Anomalies</p>
                 <p className="text-xl font-black text-soc-critical animate-pulse">{stats?.critical_active || 0}</p>
              </div>
              <div className="text-center">
                 <p className="text-[9px] text-soc-muted font-bold uppercase tracking-widest mb-1">Defense Autonomy</p>
                 <p className="text-[10px] mt-2 font-black text-soc-primary uppercase tracking-[0.2em]">{stats?.autonomy_mode || "INITIALIZING"}</p>
              </div>
           </div>
        </div>

        {/* Live Terminal Streaming Log */}
        <div className="col-span-1 lg:col-span-2 border border-soc-border bg-[#0b0e14]/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl relative font-mono text-xs flex flex-col h-72 group">
           <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5 shrink-0">
               <div className="flex items-center space-x-3 text-soc-primary">
                  <Terminal size={16} />
                  <span className="font-bold uppercase tracking-[0.3em] text-[10px]">Real-Time Data Pipeline Stream</span>
               </div>
               <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded-full bg-soc-critical/50"></div>
                  <div className="w-3 h-3 rounded-full bg-soc-warning/50"></div>
                  <div className="w-3 h-3 rounded-full bg-soc-primary/50 animate-pulse"></div>
               </div>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 mask-image-bottom flex-col-reverse flex">
              {liveLogs.length === 0 ? (
                 <div className="text-soc-muted/40 italic flex h-full items-center justify-center">Awaiting incoming telemetry arrays...</div>
              ) : (
                 <ul className="space-y-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    {liveLogs.map((log, idx) => (
                       <li key={idx} className="flex">
                         <span className="text-soc-muted mr-3 shrink-0">&gt;</span>
                         <span className={`break-all ${idx === 0 ? 'text-soc-primary font-bold shadow-soc-primary' : 'text-soc-muted'}`}>{log}</span>
                       </li>
                    ))}
                 </ul>
              )}
           </div>
        </div>
      </div>

      {/* Cyber Intelligence Array - Live Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
         {[
           { label: "Detected Telemetry Logs", val: stats ? stats.total_logs : "---", color: "text-soc-secondary", icon: Database },
           { label: "Critical Anomalies", val: stats ? stats.total_alerts : "---", color: "text-soc-critical", icon: Shield },
           { label: "Active Sensor Nodes", val: stats ? stats.sensors : "---", color: "text-soc-primary", icon: Network },
           { label: "System Uptime Code", val: "OPERATIONAL", color: "text-accent", icon: Cpu }
         ].map((s, i) => (
           <div key={i} className="bg-soc-panel/30 border border-soc-border p-6 rounded-3xl hover:bg-soc-panel/50 transition-colors backdrop-blur-xl group">
              <s.icon size={28} className={`${s.color} opacity-40 mb-6 group-hover:opacity-100 transition-opacity`} />
              <p className="text-[10px] font-black text-soc-muted uppercase tracking-widest mb-2">{s.label}</p>
              <h3 className={`text-4xl font-black italic tracking-tighter ${s.color}`}>{s.val}</h3>
           </div>
         ))}
      </div>

      {/* Analyst Training Guide */}
      <div className="space-y-8 relative z-10 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-soc-border pb-6">
           <div className="flex items-center space-x-4">
              <Globe2 size={28} className="text-soc-secondary animate-spin-slow" />
              <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter italic text-white flex flex-col">
                 <span>Analyst Operating Standard (A.O.S)</span>
                 <span className="text-[10px] text-soc-muted tracking-[0.4em] mt-1 font-bold">CLASSIFIED MODULE DOCUMENTATION & GUIDANCE</span>
              </h2>
           </div>
           <div className="mt-4 md:mt-0 px-4 py-2 bg-soc-critical/5 border-l-2 border-soc-critical flex items-center text-soc-critical text-[10px] uppercase font-black tracking-widest">
              <AlertTriangle size={14} className="mr-2" /> RESTRICTED ACCESS
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[
             { title: "Command Center", route: "/dashboard", icon: Activity, desc: "The brain of the SIEM. Visualizes real-time metrics, geographical active threats, and aggregated data parsing in single view." },
             { title: "Threat Alerts", route: "/alerts", icon: Shield, desc: "Monitors WebSocket telemetry streams for active IDS/DPI/SIEM matches. Playbooks exist here to execute 1-click SOAR automations." },
             { title: "Threat Simulation", route: "/simulator", icon: Crosshair, desc: "Injects synthetic MITRE ATT&CK telemetry (e.g. Suricata Scans, Emotet) directly into the ingest pipeline for realistic alert validation." },
             { title: "Remote Sensors", route: "/sensors", icon: Network, desc: "Manage zero-install reverse agents. Copy the 1-liner payload to deploy live telemetry capture on external Windows endpoints." },
             { title: "Behavioral Analytics", route: "/behavior", icon: Cpu, desc: "Employs an advanced profiling engine to baseline normal user activities and detects invisible anomalies like privilege escalation." },
             { title: "Deception Ops", route: "/deception", icon: Lock, desc: "Deploys hidden Honeypots and decoy credentials on the network to trap laterally-moving adversaries in a controlled sandbox." }
           ].map((g, i) => (
             <Link to={g.route} key={i} className="block w-full bg-soc-bg hover:bg-[#0b0e14] border border-soc-border rounded-[1rem] p-8 group transition-all hover:border-soc-primary shadow-[inset_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-soc-primary/10 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-soc-primary/20 transition-all pointer-events-none"></div>
                <div className="w-12 h-12 bg-soc-panel rounded border border-soc-border flex items-center justify-center mb-6 group-hover:bg-soc-primary/10 group-hover:border-soc-primary/50 transition-all">
                   <g.icon size={22} className="text-soc-muted group-hover:text-soc-primary" />
                </div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-3 group-hover:text-soc-primary transition-colors flex items-center">
                   {g.title} <ArrowRight size={14} className="ml-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-bold" />
                </h3>
                <p className="text-[11px] font-bold text-soc-muted tracking-widest uppercase opacity-70 leading-relaxed font-mono">{g.desc}</p>
             </Link>
           ))}
        </div>
      </div>
    </div>
  );
}

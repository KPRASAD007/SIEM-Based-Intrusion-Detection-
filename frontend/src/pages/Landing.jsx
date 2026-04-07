import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Activity, Database, Crosshair, ArrowRight, Zap, Orbit, Cpu, Network, Clock, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [typedText, setTypedText] = useState('');
  const [stats, setStats] = useState(null);
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
    fetch(`http://${window.location.hostname}:8080/api/search/topology`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
      
      {/* Hero Section */}
      <div className="relative border-2 border-soc-primary/30 rounded-[3rem] p-10 lg:p-20 overflow-hidden bg-soc-panel/60 shadow-[0_0_80px_rgba(16,185,129,0.15)] group backdrop-blur-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-soc-primary/5 to-transparent z-0 group-hover:from-soc-primary/10 transition-colors duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-soc-primary rounded-full blur-[150px] opacity-10 mix-blend-screen pointer-events-none -mt-40 -mr-40"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
           <div className="flex items-center space-x-3 bg-soc-bg border border-soc-border p-2 pr-6 rounded-full shadow-2xl">
              <div className="w-10 h-10 rounded-full bg-soc-primary flex items-center justify-center animate-pulse">
                 <Terminal size={18} className="text-soc-bg" />
              </div>
              <span className="font-mono text-[10px] text-soc-primary uppercase tracking-[0.3em] font-black">{typedText}<span className="inline-block w-2.5 h-3.5 bg-soc-primary animate-ping ml-1 opacity-80"></span></span>
           </div>
           
           <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">
              CYBERDETECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-soc-primary to-soc-secondary">LAB v2</span>
           </h1>
           
           <p className="text-soc-muted text-lg tracking-widest uppercase font-bold max-w-2xl leading-relaxed">
             Advanced Next-Gen Security Information & Event Management (SIEM) with Zero-Trust Telemetry, AI Sandbox, and Real-Time Orchestration.
           </p>

           <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
             <Link to="/simulator" className="group flex items-center justify-center px-10 py-5 bg-soc-primary text-soc-bg text-sm font-black uppercase tracking-[0.2em] italic rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]">
               <Crosshair size={18} className="mr-3" /> Initiate Live Fire Sim
             </Link>
             <Link to="/dashboard" className="group flex items-center justify-center px-10 py-5 bg-soc-bg border-2 border-soc-border text-white text-sm font-black uppercase tracking-[0.2em] italic rounded-2xl hover:border-soc-secondary transition-all shadow-2xl">
               <Activity size={18} className="mr-3 text-soc-secondary group-hover:scale-125 transition-transform" /> Enter Command Center
             </Link>
           </div>
        </div>
      </div>

      {/* Cyber Intelligence Array - Live Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="space-y-8 relative">
        <div className="flex items-center space-x-4">
           <Zap size={24} className="text-soc-primary" />
           <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white">Analyst Operating Standard (A.O.S)</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[
             { title: "Command Center", route: "/dashboard", desc: "The brain of the SIEM. Visualizes real-time metrics, geographical active threats, and aggregated data parsing in single view." },
             { title: "Threat Alerts", route: "/alerts", desc: "Monitors WebSocket telemetry streams for active IDS/DPI/SIEM matches. Playbooks exist here to execute 1-click SOAR automations." },
             { title: "Threat Simulation", route: "/simulator", desc: "Injects synthetic MITRE ATT&CK telemetry (e.g. Suricata Scans, Emotet) directly into the ingest pipeline for realistic alert validation." },
             { title: "Remote Sensors", route: "/sensors", desc: "Manage zero-install reverse agents. Copy the 1-liner payload to deploy live telemetry capture on external Windows endpoints." },
             { title: "Behavioral Analytics", route: "/behavior", desc: "Employs an advanced profiling engine to baseline normal user activities and detects invisible anomalies like privilege escalation." },
             { title: "Deception Ops", route: "/deception", desc: "Deploys hidden Honeypots and decoy credentials on the network to trap laterally-moving adversaries in a controlled sandbox." }
           ].map((g, i) => (
             <Link to={g.route} key={i} className="block w-full bg-soc-bg border border-soc-border rounded-[2rem] p-8 group hover:-translate-y-2 transition-all hover:border-soc-secondary shadow-lg">
                <div className="w-12 h-12 bg-soc-panel rounded-2xl flex items-center justify-center mb-6 group-hover:bg-soc-secondary group-hover:text-soc-bg transition-colors border border-soc-border">
                   <ArrowRight size={20} className="text-soc-muted group-hover:text-soc-bg" />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-3">{g.title}</h3>
                <p className="text-[11px] font-bold text-soc-muted tracking-wide leading-relaxed">{g.desc}</p>
             </Link>
           ))}
        </div>
      </div>
    </div>
  );
}

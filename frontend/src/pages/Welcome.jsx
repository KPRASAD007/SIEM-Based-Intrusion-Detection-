import React, { useState, useEffect } from 'react';
import { Shield, Fingerprint } from 'lucide-react';

export default function Welcome({ username, onComplete }) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState([]);
  
  const glitchChars = "01ABCD";
  const [glitchText, setGlitchText] = useState("");
  const heroUrl = `http://127.0.0.1:8080/api/download/hero.png`;

  const bootLogs = [
    "UPLINK_ESTABLISHED",
    "CLEARANCE_VERIFIED",
    "NEURAL_NET_READY",
    "VANGUARD_ACTIVE"
  ];

  useEffect(() => {
    // Phase 1: Rapid Initialization
    setGlitchText(username.toUpperCase());
    
    setTimeout(() => {
      setPhase(1);
    }, 1200); 
  }, [username]);

  // Phase 2: Rapid Loading
  useEffect(() => {
    if (phase >= 1) {
      const progInt = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(progInt);
            setPhase(2);
            setTimeout(onComplete, 800);
            return 100;
          }
          return p + 8;
        });
      }, 80);

      let logIdx = 0;
      const logInt = setInterval(() => {
        if (logIdx < bootLogs.length) {
          setVisibleLogs(prev => [...prev, bootLogs[logIdx]]);
          logIdx++;
        } else {
          clearInterval(logInt);
        }
      }, 250);

      return () => {
        clearInterval(progInt);
        clearInterval(logInt);
      }
    }
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 bg-soc-bg flex flex-col items-center justify-center font-orbitron overflow-hidden z-[9999] select-none selection:bg-soc-primary selection:text-soc-bg">
      
      {/* --- BACKGROUND LAYERS (Matching Login.jsx) --- */}
      {/* Layer 1: Glitch Overlay Effect */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-soc-panel via-soc-bg to-soc-bg mix-blend-multiply pointer-events-none"></div>
      
      {/* Layer 5: Center focal glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.03)_0%,transparent_55%)] pointer-events-none z-0"></div>

      {/* Hero Background Image - Professional Opacity */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none bg-center bg-cover grayscale contrast-125"
        style={{ backgroundImage: `url(${heroUrl})` }}
      ></div>
      
      {/* Layer 2: Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0"></div>

      {/* Layer 3: Hero Lighting Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-soc-primary/5 rounded-full blur-[150px] z-0"></div>

      {/* --- CONTENT --- */}
      <div className="relative z-20 flex flex-col items-center max-w-4xl w-full px-4 animate-in fade-in zoom-in-95 duration-[500ms] ease-out">
        
        {/* CYBERDETECT LOGO - Cleaned & Holo-Integrated */}
        <div className="text-center mb-12 relative animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-48 h-48 mx-auto mb-8 relative group flex items-center justify-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 shadow-[inner_0_0_20px_rgba(255,255,255,0.05)]">
             {/* Micro-nodes at corners */}
             <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-soc-primary shadow-[0_0_5px_#00f3ff]"></div>
             <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-soc-primary shadow-[0_0_5px_#00f3ff]"></div>
             <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-soc-primary shadow-[0_0_5px_#00f3ff]"></div>
             <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-soc-primary shadow-[0_0_5px_#00f3ff]"></div>

             {/* Deep Ambient Focal Glow */}
             <div className="absolute inset-6 bg-soc-primary blur-[40px] opacity-10 group-hover:opacity-30 transition-all duration-1000"></div>
             
             {/* Large & Professional Logo Image - Screen blended for neatness */}
             <img 
                src="/emblem.png" 
                alt="CyberDetect Lab" 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-transform duration-1000 group-hover:scale-110 mix-blend-screen" 
             />
          </div>

          <h1 className="text-5xl font-light text-slate-100 tracking-[0.2em] uppercase">
            VANGUARD<span className="text-soc-primary">_AI</span>
          </h1>
          <p className="text-soc-muted mt-2 text-[10px] uppercase tracking-[0.6em] font-sans">Enterprise Security Nexus</p>
        </div>

        {/* WELCOME SEQUENCE SECTION */}
        <div className="w-full max-w-lg space-y-12">
          
          {/* Welcome Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-light tracking-[0.4em] text-white uppercase">
              INITIALIZED
            </h2>
            <div className="text-sm font-mono tracking-widest text-soc-primary uppercase opacity-60">
              {username} // Access Granted
            </div>
          </div>

          {/* Terminal Boot Logs & Progress */}
          <div className={`space-y-6 transition-opacity duration-1000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-soc-bg/80 border border-soc-border p-6 font-mono text-xs relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-soc-primary/50 to-transparent"></div>
               <div className="flex flex-col space-y-2 h-32 justify-end">
                 {visibleLogs.map((log, i) => (
                   <div key={i} className="animate-in slide-in-from-left-4 duration-500 flex items-center space-x-3">
                      <span className="text-soc-secondary font-black">{'>'}</span>
                      <span className={`tracking-widest ${i === bootLogs.length - 1 ? 'text-soc-primary font-black' : 'text-soc-text/70'}`}>
                        {log}
                      </span>
                   </div>
                 ))}
                 {phase === 2 && (
                   <div className="text-soc-hacker font-black flex items-center animate-pulse mt-2">
                     <span className="mr-3">●</span> SYSTEM READY // REDIRECTING...
                   </div>
                 )}
               </div>
            </div>

            {/* Substantial Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-soc-primary uppercase tracking-widest">
                <span>Initialization Progress</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <div className="h-2 bg-soc-border/50 border border-soc-border overflow-hidden relative">
                 <div 
                   className="absolute top-0 left-0 h-full bg-gradient-to-r from-soc-secondary via-soc-primary to-soc-secondary shadow-[0_0_20px_rgba(0,243,255,0.8)] transition-all duration-300 ease-out"
                   style={{ width: `${progress}%` }}
                 ></div>
                 {/* Scanline passing over loading bar */}
                 <div className="absolute top-0 bottom-0 w-24 bg-white/20 blur-md skew-x-[-25deg] animate-[scan_2s_linear_infinite]"></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Vanguard AI Marker */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center space-x-4">
        <div className="h-[1px] w-12 bg-soc-border"></div>
        <span className="text-[10px] font-black text-soc-muted uppercase tracking-[1em]">Vanguard AI // L5</span>
      </div>

    </div>
  );
}

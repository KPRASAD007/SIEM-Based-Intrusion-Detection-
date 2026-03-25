import React, { useState } from 'react';
import { Radar, Target, Zap, Shield, Activity, Lock, FlaskConical, Fingerprint, Layers, Cpu, ShieldCheck, ChevronRight, AlertTriangle } from 'lucide-react';

const KILL_CHAIN_PHASES = [
  { id: 'recon', name: 'Recon', icon: Radar, color: '#3B82F6', tactic: ['TA0007', 'TA0043'], desc: 'Adversary scouting and metadata gathering' },
  { id: 'weaponization', name: 'Weapon', icon: FlaskConical, color: '#6366F1', tactic: ['TA0042'], desc: 'Malware delivery preparation & payload coupling' },
  { id: 'delivery', name: 'Delivery', icon: Zap, color: '#EAB308', tactic: ['TA0001'], desc: 'Transmission of malicious artifacts to environment' },
  { id: 'exploitation', name: 'Exploit', icon: Activity, color: '#F97316', tactic: ['TA0002', 'TA0004'], desc: 'Execution of malicious code via vulnerabilities' },
  { id: 'installation', name: 'Install', icon: Shield, color: '#A855F7', tactic: ['TA0003', 'TA0005'], desc: 'Establishing persistent presence & local control' },
  { id: 'c2', name: 'C&C', icon: Target, color: '#EF4444', tactic: ['TA0011'], desc: 'Establishing command & control communication' },
  { id: 'actions', name: 'Objectives', icon: Lock, color: '#991B1B', tactic: ['TA0040', 'TA0010'], desc: 'Data exfiltration and mission completion' }
];

export default function KillChainVisualization({ activeTactics = [], techniques = [] }) {
  const [hoveredPhase, setHoveredPhase] = useState(null);
  
  const lastActiveIndex = [...KILL_CHAIN_PHASES].reverse().findIndex(p => 
    p.tactic.some(t => activeTactics.includes(t))
  );
  const activeReach = lastActiveIndex === -1 ? -1 : KILL_CHAIN_PHASES.length - 1 - lastActiveIndex;

  const currentPhase = activeReach >= 0 ? KILL_CHAIN_PHASES[activeReach] : null;

  return (
    <div className="w-full bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border rounded-[2.5rem] p-12 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden relative group">
      {/* Dynamic Cyber-Matrix Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.08)_0%,transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-soc-secondary/50 to-transparent animate-scan-fast shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-soc-secondary/10 rounded-2xl border-2 border-soc-secondary/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
               <Activity size={28} className="text-soc-secondary animate-pulse" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                ATTACK_CYCLE_TELEMETRY
              </h3>
              <p className="text-[10px] text-soc-muted font-black uppercase tracking-[0.6em] mt-1">FORENSIC_KILL_CHAIN_VISUALIZATION_PRO</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 bg-soc-bg/80 px-8 py-4 rounded-[1.5rem] border-2 border-soc-border backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col items-center space-y-2">
                <span className="text-[8px] font-black text-soc-muted uppercase tracking-[0.2em]">Propagation_Depth</span>
                <div className="flex space-x-2">
                    {KILL_CHAIN_PHASES.map((_, i) => (
                        <div key={i} className={`w-2 h-4 rounded-sm transition-all duration-500 ${i <= activeReach ? 'bg-soc-critical shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'bg-soc-border opacity-30Scale-75'}`}></div>
                    ))}
                </div>
            </div>
            <div className="h-10 w-[1px] bg-soc-border"></div>
            <div className={`px-5 py-2 rounded-xl border-2 transition-all duration-500 flex flex-col items-center
                ${activeReach >= 0 ? 'border-soc-critical text-soc-critical bg-soc-critical/5 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-soc-border text-soc-muted opacity-50'}`}>
                <span className="text-[8px] font-black uppercase tracking-widest mb-1 italic">State_Vector</span>
                <span className="text-[12px] font-black uppercase tracking-[0.2em] italic">
                   {activeReach >= 0 ? 'BREACH_ACTIVE' : 'SYSTEM_STABLE'}
                </span>
            </div>
        </div>
      </div>
      
      <div className="relative flex items-center justify-between min-h-[280px] z-10 px-6 lg:px-12">
        {/* Advanced Logic Flow Path */}
        <svg className="absolute top-[40%] left-0 w-full h-24 -translate-y-1/2 pointer-events-none overflow-visible px-24">
          <path 
            d={`M 0 48 L 100% 48`} 
            stroke="rgba(255,255,255,0.03)" 
            strokeWidth="2" 
            fill="none" 
          />
          {activeReach >= 0 && (
            <path 
              id="activePath"
              d={`M 0 48 L ${(activeReach / (KILL_CHAIN_PHASES.length-1)) * 100}% 48`} 
              stroke="url(#killchainGradient)" 
              strokeWidth="6" 
              fill="none" 
              className="animate-dash-glow"
              strokeDasharray="20 40"
              filter="url(#hyperGlow)"
            />
          )}
          <defs>
            <linearGradient id="killchainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="hyperGlow">
              <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Moving Particles along Path */}
          {activeReach > 0 && [...Array(3)].map((_, i) => (
             <circle key={i} r="3" fill="#ef4444" className="path-particle">
                <animateMotion 
                   dur={`${3 + i}s`} 
                   repeatCount="indefinite" 
                   path={`M 0 48 L ${(activeReach / (KILL_CHAIN_PHASES.length-1)) * 100}% 48`}
                />
             </circle>
          ))}
        </svg>
        
        {KILL_CHAIN_PHASES.map((phase, index) => {
          const isReached = index <= activeReach;
          const isCurrent = index === activeReach;
          const isHovered = hoveredPhase === phase.id;
          const Icon = phase.icon;
          
          return (
            <div 
              key={phase.id} 
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredPhase(phase.id)}
              onMouseLeave={() => setHoveredPhase(null)}
            >
              {/* Cinematic Hexagonal Node */}
              <div 
                className={`z-20 w-24 h-24 relative flex items-center justify-center transition-all duration-700 cursor-help
                  ${isReached ? 'scale-110' : 'scale-90 opacity-20 grayscale hover:opacity-50'}
                  ${isCurrent ? 'z-30 drop-shadow-[0_0_25px_rgba(239,68,68,0.4)]' : ''}
                  ${isHovered ? 'rotate-[30deg]' : ''}`}
              >
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  {/* Outer Rings */}
                  <polygon 
                    points="50,2 98,25 98,75 50,98 2,75 2,25" 
                    fill="none" 
                    stroke={isCurrent ? "#ef4444" : isReached ? phase.color : 'rgba(255,255,255,0.05)'} 
                    strokeWidth="1"
                    className="opacity-20 animate-spin-slow"
                  />
                  {/* Main Hexagon */}
                  <polygon 
                    points="50,8 93,28 93,72 50,92 7,72 7,28" 
                    fill={isCurrent ? "rgba(239,68,68,0.2)" : isReached ? "rgba(15,23,42,0.9)" : "rgba(15,23,42,0.5)"} 
                    stroke={isCurrent ? "#ef4444" : isReached ? phase.color : 'rgba(255,255,255,0.1)'} 
                    strokeWidth={isCurrent ? "5" : "2"}
                    className={isCurrent ? 'animate-pulse' : ''}
                  />
                  {/* Inner Tech Lines */}
                  {isReached && (
                    <>
                       <line x1="50" y1="15" x2="50" y2="30" stroke={isCurrent ? "#ef4444" : phase.color} strokeWidth="1" className="opacity-40" />
                       <line x1="50" y1="85" x2="50" y2="70" stroke={isCurrent ? "#ef4444" : phase.color} strokeWidth="1" className="opacity-40" />
                    </>
                  )}
                </svg>
                
                <Icon size={32} className={`relative z-10 transition-all duration-500 transform
                  ${isHovered ? 'scale-125' : ''}
                  ${isCurrent ? 'text-soc-critical animate-pulse' : isReached ? 'text-white' : 'text-soc-muted'}`} />
                
                {/* Stage T-Sign */}
                <div className={`absolute -top-12 text-[10px] font-black uppercase tracking-tighter transition-all duration-500
                   ${isReached ? 'opacity-100' : 'opacity-40'} ${index % 2 === 0 ? '-translate-y-2' : ''}`}>
                   <span className="text-soc-muted mr-1">NODE_</span>
                   <span className={isCurrent ? 'text-soc-critical font-bold underline' : 'text-white'}>0{index + 1}</span>
                </div>

                {isCurrent && (
                   <div className="absolute inset-0 rounded-full border-4 border-soc-critical/30 animate-ping"></div>
                )}
              </div>
              
              {/* Detailed Label Area */}
              <div className={`mt-10 text-center transition-all duration-700 max-w-[120px] ${isReached ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                <p className={`text-[12px] font-black uppercase tracking-widest italic leading-none mb-2 ${isCurrent ? 'text-soc-critical' : isReached ? 'text-white' : 'text-soc-muted'}`}>
                  {phase.name}
                </p>
                <div className={`h-[1px] mx-auto transition-all duration-500
                   ${isCurrent ? 'bg-soc-critical w-full' : isReached ? 'bg-soc-primary/40 w-8' : 'bg-transparent w-0'}`}></div>
                <p className={`text-[8px] font-bold text-soc-muted uppercase mt-2 tracking-tighter transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                   {phase.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Re-Engineered Semantic Intelligence Dashboard */}
      <div className="mt-20 grid grid-cols-1 lg:grid-cols-4 gap-10 relative z-10 border-t-2 border-soc-border pt-16">
        <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
               <h4 className="text-[11px] font-black text-soc-primary uppercase tracking-[0.4em] flex items-center italic">
                   <ShieldCheck size={18} className="mr-3" /> ADVERSARY_TTP_CORRELATION
               </h4>
               <div className="flex space-x-2">
                   <div className="px-3 py-1 bg-soc-bg border border-soc-border rounded-lg text-[8px] font-black text-soc-muted italic uppercase">Build_V8.4</div>
                   <div className="px-3 py-1 bg-soc-primary/10 border border-soc-primary/30 rounded-lg text-[8px] font-black text-soc-primary italic uppercase animate-pulse">Live_Sync</div>
               </div>
            </div>

            <div className="bg-soc-panel/40 border-2 border-soc-border rounded-[2rem] p-10 relative overflow-hidden backdrop-blur-3xl group/info">
                <div className="absolute top-0 right-0 p-10 opacity-0 group-hover/info:opacity-10 transition-opacity duration-500 pointer-events-none">
                    <Radar size={200} className="text-soc-primary" />
                </div>
                {currentPhase ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        <div className="md:col-span-8 space-y-6">
                            <div className="flex items-center space-x-4">
                               <span className="px-4 py-1.5 bg-soc-critical/20 text-soc-critical border-2 border-soc-critical/40 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">CURRENT_BREACH_PHASE</span>
                               <ChevronRight size={16} className="text-soc-muted" />
                               <span className="text-white font-black italic uppercase tracking-widest text-lg">{currentPhase.name}</span>
                            </div>
                            <h5 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">
                               Confirmed {currentPhase.name} <span className="text-soc-secondary">Signature</span> Match
                            </h5>
                            <p className="text-sm text-soc-text font-bold leading-relaxed opacity-80 border-l-4 border-soc-secondary pl-6 italic">
                               Expert Analysis: {currentPhase.desc}. Current telemetry suggests the adversary has bypassed <span className="text-soc-primary">Tier-1 Perimeter Guards</span> and is currently executing within the <span className="text-soc-warning italic">Payload_Delivery_Subsystem</span>.
                            </p>
                        </div>
                        <div className="md:col-span-4 flex flex-col justify-center space-y-6 bg-soc-bg/40 p-8 rounded-[1.5rem] border-2 border-soc-border shadow-inner">
                            <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black text-soc-muted uppercase tracking-widest italic">Signal_Confidence</span>
                                  <span className="text-soc-primary font-black text-xs">98.4%</span>
                               </div>
                               <div className="w-full bg-soc-border h-2 rounded-full overflow-hidden">
                                  <div className="h-full bg-soc-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '98.4%' }}></div>
                               </div>
                            </div>
                            <div className="flex items-center justify-between">
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-soc-muted uppercase tracking-widest italic">Attacker_Intent</span>
                                  <span className="text-white font-black text-[11px] uppercase italic">Destruction_Exfil</span>
                               </div>
                               <AlertTriangle size={24} className="text-soc-critical animate-bounce-slow" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
                       <div className="p-8 bg-soc-primary/5 rounded-full border-2 border-soc-primary/20 animate-pulse-slow">
                          <ShieldCheck size={64} className="text-soc-primary" />
                       </div>
                       <div>
                          <p className="text-2xl font-black text-white tracking-tight uppercase italic mb-2">OPERATIONAL_STASIS</p>
                          <p className="text-xs text-soc-muted font-bold tracking-widest uppercase italic max-w-md mx-auto">
                             Neural engine scan complete. No adversarial kill-chain signatures currently correlated with active telemetry streams.
                          </p>
                       </div>
                    </div>
                )}
            </div>
        </div>
        
        <div className="space-y-10">
            <div className="space-y-6">
                <h4 className="text-[11px] font-black text-soc-secondary uppercase tracking-[0.3em] flex items-center italic">
                    <Layers size={18} className="mr-3" /> SIGNAL_POLARITY
                </h4>
                <div className="space-y-4 bg-soc-panel/60 border-2 border-soc-border p-8 rounded-[1.5rem] relative overflow-hidden backdrop-blur-2xl">
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center justify-between group/sig">
                            <div className="flex items-center space-x-4">
                               <div className="w-5 h-5 rounded-lg bg-soc-critical shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse"></div>
                               <span className="text-[10px] font-black text-white uppercase tracking-widest italic transition-all group-hover/sig:translate-x-1 underline decoration-soc-critical/50">BREACH_ACTIVE</span>
                            </div>
                            <Cpu size={14} className="text-soc-critical opacity-40" />
                        </div>
                        <div className="flex items-center justify-between group/sig">
                            <div className="flex items-center space-x-4">
                               <div className="w-5 h-5 rounded-lg bg-soc-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
                               <span className="text-[10px] font-black text-white uppercase tracking-widest italic transition-all group-hover/sig:translate-x-1 underline decoration-soc-primary/50">SIGNAL_LOCKED</span>
                            </div>
                            <Cpu size={14} className="text-soc-primary opacity-40" />
                        </div>
                        <div className="flex items-center justify-between group/sig opacity-20 filter grayscale">
                            <div className="flex items-center space-x-4">
                               <div className="w-5 h-5 rounded-lg bg-soc-border border border-white/20"></div>
                               <span className="text-[10px] font-black text-white uppercase tracking-widest italic transition-all group-hover/sig:translate-x-1">DORMANT_ZONE</span>
                            </div>
                            <Cpu size={14} className="text-soc-muted opacity-40" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-soc-critical/5 border-2 border-soc-critical/30 rounded-[2rem] p-8 shadow-inner">
               <p className="text-[10px] text-white font-black leading-relaxed uppercase tracking-tight italic flex items-start">
                  <AlertTriangle size={18} className="mr-3 text-soc-critical shrink-0" />
                  Visual_engine_is_synced_with_realtime_SIEM_logic. High_alert_red_states_require_immediate_SOAR_isolation_action.
               </p>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes scan-fast {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(1200%); opacity: 0; }
        }
        .animate-scan-fast {
          animation: scan-fast 4s ease-in-out infinite;
        }
        @keyframes dash-glow {
          to { stroke-dashoffset: -120; }
        }
        .animate-dash-glow {
          animation: dash-glow 10s linear infinite;
        }
        .path-particle {
           filter: blur(1px);
           opacity: 0.8;
           animation: particle-glow 2s infinite alternate;
        }
        @keyframes particle-glow {
           from { fill: #ef4444; }
           to { fill: #f87171; r: 5; }
        }
        .animate-spin-slow {
           animation: spin 20s linear infinite;
        }
        @keyframes bounce-slow {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
           animation: bounce-slow 3s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

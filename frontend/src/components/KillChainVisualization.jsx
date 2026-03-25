import React from 'react';
import { Radar, Target, Zap, Shield, Activity, Lock, FlaskConical, Fingerprint, Layers, Cpu } from 'lucide-react';

const KILL_CHAIN_PHASES = [
  { id: 'recon', name: 'Recon', icon: Radar, color: '#3B82F6', tactic: ['TA0007', 'TA0043'], desc: 'Intelligence gathering' },
  { id: 'weaponization', name: 'Weapon', icon: FlaskConical, color: '#6366F1', tactic: ['TA0042'], desc: 'Malware preparation' },
  { id: 'delivery', name: 'Delivery', icon: Zap, color: '#EAB308', tactic: ['TA0001'], desc: 'Transmission to target' },
  { id: 'exploitation', name: 'Exploit', icon: Activity, color: '#F97316', tactic: ['TA0002', 'TA0004'], desc: 'Code execution' },
  { id: 'installation', name: 'Install', icon: Shield, color: '#A855F7', tactic: ['TA0003', 'TA0005'], desc: 'Persistence & Control' },
  { id: 'c2', name: 'C&C', icon: Target, color: '#EF4444', tactic: ['TA0011'], desc: 'Command & Control' },
  { id: 'actions', name: 'Exfil', icon: Lock, color: '#991B1B', tactic: ['TA0040', 'TA0010'], desc: 'Final Objectives' }
];

export default function KillChainVisualization({ activeTactics = [], techniques = [] }) {
  // activeTactics is an array of MITRE tactic IDs (TAxxxx)
  // techniques is an array of technique strings (Txxxx)
  
  const lastActiveIndex = [...KILL_CHAIN_PHASES].reverse().findIndex(p => 
    p.tactic.some(t => activeTactics.includes(t))
  );
  const activeReach = lastActiveIndex === -1 ? -1 : KILL_CHAIN_PHASES.length - 1 - lastActiveIndex;

  const currentPhase = activeReach >= 0 ? KILL_CHAIN_PHASES[activeReach] : null;

  return (
    <div className="w-full bg-soc-panel border border-soc-border rounded-xl p-8 shadow-2xl overflow-hidden relative group">
      {/* Background Radar Effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-1 bg-[radial-gradient(circle,var(--soc-primary)_0%,transparent_70%)] animate-scan"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.2)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-soc-text uppercase tracking-[0.2em] flex items-center">
            <Fingerprint size={18} className="mr-2 text-soc-primary animate-pulse" />
            Adversary Kill-Chain Lifecycle
          </h3>
          <p className="text-[10px] text-soc-muted mt-1 font-mono uppercase tracking-tighter">Forensic Behavioral Correlation</p>
        </div>
        <div className="flex items-center space-x-3">
            <div className="flex -space-x-1">
                {KILL_CHAIN_PHASES.map((p, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full border border-soc-panel ${i <= activeReach ? 'bg-soc-danger' : 'bg-soc-border'}`}></div>
                ))}
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded border-2 ${activeReach >= 0 ? 'border-soc-danger text-soc-danger bg-soc-danger/10 animate-pulse' : 'border-soc-border text-soc-muted'}`}>
                {activeReach >= 0 ? 'INTRUSION DETECTED' : 'SYSTEM SECURE'}
            </span>
        </div>
      </div>
      
      <div className="relative flex items-center justify-between min-h-[160px] z-10 px-4">
        {/* Connection Line with Flowing Particle Effect */}
        <svg className="absolute top-1/2 left-0 w-full h-8 -translate-y-1/2 pointer-events-none overflow-visible px-12">
          <path 
            d={`M 0 16 L ${100}% 16`} 
            stroke="var(--soc-border)" 
            strokeWidth="1" 
            fill="none" 
            strokeDasharray="2 4"
          />
          {activeReach >= 0 && (
            <path 
              d={`M 0 16 L ${(activeReach / (KILL_CHAIN_PHASES.length-1)) * 100}% 16`} 
              stroke="url(#lineGradient)" 
              strokeWidth="4" 
              fill="none" 
              className="animate-dash"
              strokeDasharray="15 30"
            />
          )}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
        </svg>
        
        {KILL_CHAIN_PHASES.map((phase, index) => {
          const isActive = phase.tactic.some(t => activeTactics.includes(t));
          const isReached = index <= activeReach;
          const isCurrent = index === activeReach;
          const Icon = phase.icon;
          
          return (
            <div key={phase.id} className="relative flex flex-col items-center group/node">
              {/* node hexagonal container */}
              <div 
                className={`z-20 w-16 h-16 relative flex items-center justify-center transition-all duration-700 
                  ${isReached ? 'scale-110' : 'scale-90 opacity-30 grayscale'}
                  ${isCurrent ? 'drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''}`}
              >
                {/* Custom Hexagon SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <polygon 
                    points="50,5 95,25 95,75 50,95 5,75 5,25" 
                    fill={isCurrent ? "rgba(239,68,68,0.1)" : "var(--soc-bg)"} 
                    stroke={isReached ? (isCurrent ? "#EF4444" : phase.color) : 'var(--soc-border)'} 
                    strokeWidth={isCurrent ? "5" : "2"}
                    className={isCurrent ? 'animate-pulse' : ''}
                  />
                </svg>
                
                <Icon size={24} style={{ color: isReached ? (isCurrent ? "#EF4444" : phase.color) : 'var(--soc-muted)' }} />
                
                {/* Phase ID Label */}
                <div className="absolute -top-6 text-[7px] font-black text-soc-muted opacity-40 uppercase tracking-tighter">
                   STAGE {index + 1}
                </div>
              </div>
              
              {/* label area */}
              <div className={`mt-5 text-center transition-all duration-500 ${isReached ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-50'}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-soc-danger' : isReached ? 'text-soc-text' : 'text-soc-muted'}`}>
                  {phase.name}
                </p>
                {isCurrent && (
                    <div className="flex items-center justify-center mt-1">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-soc-danger animate-ping"></span>
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Narrative Insights Panel - THIS EXPLAINS THE USE CASE */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 border-t border-soc-border/50 pt-8">
        <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-bold text-soc-primary uppercase tracking-widest flex items-center">
                <Layers size={14} className="mr-2" /> Current Intrusion Insight
            </h4>
            <div className="bg-soc-bg border border-soc-border p-4 rounded-lg relative overflow-hidden group/insight">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/insight:opacity-30 transition-opacity">
                    <Activity size={40} />
                </div>
                {currentPhase ? (
                    <div className="space-y-2">
                        <p className="text-sm text-soc-text font-medium leading-relaxed">
                            The adversary is currently in the <span className="text-soc-danger font-bold uppercase">{currentPhase.name}</span> phase.
                        </p>
                        <p className="text-xs text-soc-muted leading-relaxed italic">
                            {currentPhase.desc}. At this stage, {activeReach >= 4 ? 'the attacker has likely established deep persistence. Containment should be your top priority.' : 'this is likely an early-stage attempt. Preventing further movement can stop the full attack.'}
                        </p>
                    </div>
                ) : (
                    <p className="text-xs text-soc-muted italic">No active threat signature detected. Monitoring for lateral movement and reconnaissance patterns...</p>
                )}
            </div>
        </div>
        
        <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-soc-primary uppercase tracking-widest flex items-center">
                <Shield size={14} className="mr-2" /> Kill-Chain Legend
            </h4>
            <div className="space-y-2 bg-soc-bg border border-soc-border p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-[8px] text-soc-muted uppercase font-bold">
                    <div className="w-2 h-2 bg-soc-danger rounded-full animate-pulse"></div>
                    <span>Active Breach</span>
                </div>
                <div className="flex items-center space-x-2 text-[8px] text-soc-muted uppercase font-bold">
                    <div className="w-2 h-2 bg-soc-primary rounded-full"></div>
                    <span>Passive Detection</span>
                </div>
                <div className="flex items-center space-x-2 text-[8px] text-soc-muted uppercase font-bold">
                    <div className="w-2 h-2 bg-soc-border rounded-full"></div>
                    <span>Secure Stage</span>
                </div>
            </div>
            <p className="text-[9px] text-soc-muted leading-tight">
                Understand your enemy by tracking how they move through your infrastructure.
            </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          from { transform: translate(-50%, -100vh); }
          to { transform: translate(-50%, 100vh); }
        }
        .animate-scan {
          animation: scan 6s linear infinite;
        }
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
        .animate-dash {
          animation: dash 10s linear infinite;
        }
      `}</style>
    </div>
  );
}

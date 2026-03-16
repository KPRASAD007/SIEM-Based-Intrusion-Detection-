import React from 'react';
import { Radar, Target, Zap, Shield, Activity, Lock, FlaskConical } from 'lucide-react';

const KILL_CHAIN_PHASES = [
  { id: 'recon', name: 'Reconnaissance', icon: Radar, color: 'text-blue-400', tactic: ['TA0007', 'TA0043'] },
  { id: 'weaponization', name: 'Weaponization', icon: FlaskConical, color: 'text-indigo-400', tactic: ['TA0042'] },
  { id: 'delivery', name: 'Delivery', icon: Zap, color: 'text-yellow-400', tactic: ['TA0001'] },
  { id: 'exploitation', name: 'Exploitation', icon: Activity, color: 'text-orange-400', tactic: ['TA0002', 'TA0004'] },
  { id: 'installation', name: 'Installation', icon: Shield, color: 'text-purple-400', tactic: ['TA0003', 'TA0005'] },
  { id: 'c2', name: 'C&C', icon: Target, color: 'text-red-400', tactic: ['TA0011'] },
  { id: 'actions', name: 'Actions', icon: Lock, color: 'text-red-600', tactic: ['TA0040', 'TA0010'] }
];

export default function KillChainVisualization({ activeTactics = [] }) {
  // activeTactics is an array of MITRE tactic IDs or technique names matched for this incident
  
  return (
    <div className="w-full bg-soc-bg/30 border border-soc-border rounded-xl p-6 shadow-2xl">
      <h3 className="text-sm font-bold text-soc-text mb-6 uppercase tracking-widest flex items-center">
        <Activity size={16} className="mr-2 text-soc-primary" />
        Attack Kill-Chain Lifecycle
      </h3>
      
      <div className="relative flex items-center justify-between">
        {/* Background Connector Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-soc-border -translate-y-1/2 z-0"></div>
        
        {KILL_CHAIN_PHASES.map((phase, index) => {
          const isActive = phase.tactic.some(t => activeTactics.includes(t));
          const Icon = phase.icon;
          
          return (
            <div key={phase.id} className="relative z-10 flex flex-col items-center">
              {/* phase indicator circle */}
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 mb-2 
                ${isActive 
                  ? `${phase.color.replace('text', 'border')} bg-soc-panel scale-125 box-shadow-glow` 
                  : 'bg-soc-bg border-soc-border scale-100 opacity-40 grayscale'}`}
                title={phase.name}
              >
                <Icon size={20} className={isActive ? phase.color : 'text-soc-muted'} />
              </div>
              
              {/* phase label */}
              <div className="text-center">
                <p className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-soc-text' : 'text-soc-muted opacity-50'}`}>
                  {phase.name}
                </p>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-soc-primary inline-block absolute -bottom-2 translate-x-1/2 right-1/2 animate-pulse"></span>
                )}
              </div>
              
              {/* Step indicator */}
              <div className="absolute -top-6 text-[8px] font-mono text-soc-muted/30">
                STAGE {index + 1}
              </div>
            </div>
          );
        })}
      </div>
      
      {activeTactics.length > 0 && (
        <div className="mt-8 flex items-center justify-center space-x-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
           <div className="h-px w-12 bg-gradient-to-r from-transparent to-soc-primary/50"></div>
           <p className="text-[11px] text-soc-muted italic">
             Adversary has reached the <span className="text-soc-danger font-bold uppercase">{KILL_CHAIN_PHASES.filter(p => p.tactic.some(t => activeTactics.includes(t))).pop()?.name}</span> phase
           </p>
           <div className="h-px w-12 bg-gradient-to-l from-transparent to-soc-primary/50"></div>
        </div>
      )}
    </div>
  );
}

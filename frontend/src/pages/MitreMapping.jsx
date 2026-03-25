import React, { useState, useEffect } from 'react';
import { Target, Shield, Activity, RefreshCw } from 'lucide-react';

const TACTICS = [
  { id: 'TA0001', name: 'Initial Access', techniques: ['T1190', 'T1133', 'T1566'] },
  { id: 'TA0002', name: 'Execution', techniques: ['T1059', 'T1106', 'T1047'] },
  { id: 'TA0003', name: 'Persistence', techniques: ['T1547', 'T1053', 'T1136'] },
  { id: 'TA0004', name: 'Privilege Escalation', techniques: ['T1548', 'T1134', 'T1055'] },
  { id: 'TA0005', name: 'Defense Evasion', techniques: ['T1562', 'T1070', 'T1140'] },
  { id: 'TA0006', name: 'Credential Access', techniques: ['T1003', 'T1110', 'T1555'] },
  { id: 'TA0007', name: 'Discovery', techniques: ['T1087', 'T1046', 'T1082'] },
  { id: 'TA0008', name: 'Lateral Movement', techniques: ['T1210', 'T1550', 'T1021'] },
];

export default function MitreMapping() {
  const [coverage, setCoverage] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [ruleCount, setRuleCount] = useState(0);

  const scanCoverage = async () => {
    setIsScanning(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/rules`);
      const data = await res.json();
      const newCoverage = {};
      let active = 0;
      
      data.forEach(rule => {
        if (rule.is_active && rule.mitre_attack_id) {
          active++;
          const sev = rule.severity || 'low';
          if (!newCoverage[rule.mitre_attack_id] || sev === 'critical' || (sev === 'high' && newCoverage[rule.mitre_attack_id] !== 'critical')) {
            newCoverage[rule.mitre_attack_id] = sev;
          }
        }
      });
      
      setTimeout(() => {
        setCoverage(newCoverage);
        setRuleCount(active);
        setIsScanning(false);
      }, 1200);
    } catch (err) {
      console.error("Scan failed", err);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanCoverage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCoverageColor = (technique) => {
    const level = coverage[technique];
    switch(level) {
      case 'critical': return 'bg-soc-critical text-white border-soc-critical';
      case 'high': return 'bg-soc-warning text-soc-bg border-soc-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'medium': return 'bg-soc-primary/20 text-soc-primary border-soc-primary/50';
      case 'low': return 'bg-soc-secondary/20 text-soc-secondary border-soc-secondary/50';
      default: return 'bg-soc-panel border-soc-border text-soc-muted opacity-40';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center">
            <Target className="mr-4 text-soc-primary" size={36} /> ATTACK_COVERAGE_MAP
          </h2>
          <p className="text-[10px] font-bold text-soc-muted tracking-[0.4em] mt-3">MITRE ATT&CK® TTP VISUALIZATION & GAP ANALYSIS</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-soc-muted px-3 py-1.5 bg-soc-bg border border-soc-border rounded-lg shadow-xl"><div className="w-2.5 h-2.5 bg-soc-critical mr-2 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div> CRITICAL</div>
          <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-soc-muted px-3 py-1.5 bg-soc-bg border border-soc-border rounded-lg shadow-xl"><div className="w-2.5 h-2.5 bg-soc-warning mr-2 rounded-sm"></div> HIGH_PRI</div>
          <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-soc-muted px-3 py-1.5 bg-soc-bg border border-soc-border rounded-lg shadow-xl"><div className="w-2.5 h-2.5 bg-soc-primary mr-2 rounded-sm opacity-50"></div> ANALYTICS_READY</div>
          <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-soc-muted px-3 py-1.5 bg-soc-bg border border-soc-border rounded-lg shadow-xl"><div className="w-2.5 h-2.5 bg-soc-panel border border-soc-border mr-2 rounded-sm"></div> NO_COVERAGE</div>
        </div>
      </div>

      <div className="overflow-x-auto bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 custom-scrollbar relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none"></div>
        <div className="flex space-x-6 min-w-max">
          {TACTICS.map(tactic => (
            <div key={tactic.id} className="w-56 flex-shrink-0 flex flex-col space-y-4">
              <div className="bg-soc-bg border-l-4 border-soc-primary p-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl italic flex items-center justify-between group">
                <span className="text-white group-hover:text-soc-primary transition-colors">{tactic.name}</span>
                <span className="text-[8px] font-mono text-soc-muted opacity-50">{tactic.id}</span>
              </div>
              <div className="space-y-2">
                {tactic.techniques.map(technique => (
                  <div 
                    key={technique} 
                    className={`p-4 rounded-xl text-[10px] font-black border-2 cursor-pointer hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-between uppercase tracking-widest italic shadow-xl
                      ${getCoverageColor(technique)}`}
                    title={`Technique ${technique}`}
                  >
                    <span className="font-mono">{technique}</span>
                    {coverage[technique] ? (
                       <Shield size={14} className="ml-2 animate-pulse" />
                    ) : (
                       <div className="w-1.5 h-1.5 rounded-full bg-soc-border"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-gradient-to-br from-soc-panel to-soc-bg border-2 border-soc-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Shield size={180} />
           </div>
           <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-8 flex items-center">
             <Shield className="mr-4 text-soc-primary" size={24} /> STRATEGIC_READINESS_SUMMARY
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="flex justify-between items-end border-b-2 border-soc-border pb-3 group/stat">
                   <span className="text-[10px] font-bold text-soc-muted uppercase tracking-[0.3em]">TELEMETRY_COVERAGE</span> 
                   <span className="text-4xl font-black text-soc-primary italic tracking-tight">{Object.keys(coverage).length}<span className="text-lg opacity-30 select-none">/24</span></span>
                 </div>
                 <div className="flex justify-between items-end border-b-2 border-soc-border pb-3 group/stat">
                   <span className="text-[10px] font-bold text-soc-muted uppercase tracking-[0.3em]">CRITICAL_NODES</span> 
                   <span className="text-4xl font-black text-soc-critical italic tracking-tight">{Object.values(coverage).filter(v => v === 'critical').length < 10 ? '0' : ''}{Object.values(coverage).filter(v => v === 'critical').length}</span>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="flex justify-between items-end border-b-2 border-soc-border pb-3 group/stat">
                    <span className="text-[10px] font-bold text-soc-muted uppercase tracking-[0.3em]">ACTIVE_RULESET</span> 
                    <span className="text-4xl font-black text-white italic tracking-tight">{ruleCount < 10 ? '0' : ''}{ruleCount}</span>
                 </div>
                 <div className="flex justify-between items-end border-b-2 border-soc-border pb-3 group/stat">
                    <span className="text-[10px] font-bold text-soc-muted uppercase tracking-[0.3em]">HEALTH_INDEX</span> 
                    <span className="text-4xl font-black text-soc-warning italic tracking-tight">82<span className="text-lg opacity-30 select-none">%</span></span>
                 </div>
              </div>
           </div>
           <p className="mt-10 text-[9px] font-black text-soc-muted uppercase tracking-[0.5em] opacity-30 italic">SYSTEM_IDENTIFIED_GAPS_IN_RECONNAISSANCE_TELEMETRY</p>
        </div>

        <div className="bg-soc-panel/50 border-2 border-soc-border rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden">
           <div className="absolute inset-0 bg-soc-primary/5 animate-pulse"></div>
           <div className="p-6 bg-soc-primary/10 rounded-[2rem] border-2 border-soc-primary/30 text-soc-primary shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <Target size={40} />
           </div>
           <div>
              <p className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">AUTO_GAP_SYNC</p>
              <p className="text-[9px] text-soc-muted font-bold tracking-widest uppercase italic">REAL_TIME_MAPPING_V3.8</p>
           </div>
           <button 
             onClick={scanCoverage}
             disabled={isScanning}
             className={`w-full py-4 flex items-center justify-center rounded-2xl font-black text-[10px] uppercase tracking-widest italic shadow-xl transition-all
               ${isScanning ? 'bg-soc-primary/10 text-soc-primary border-2 border-soc-primary/30' : 'bg-soc-primary text-soc-bg hover:scale-[1.03] active:scale-95 border-2 border-transparent hover:border-white/20'}`}
           >
              {isScanning ? (
                <><RefreshCw size={14} className="mr-2 animate-spin" /> SCANNING_MATRIX...</>
              ) : (
                'INITIALIZE_SCAN'
              )}
           </button>
        </div>
      </div>
    </div>
  );
}

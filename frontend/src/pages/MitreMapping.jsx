import React from 'react';
import { Target, Shield } from 'lucide-react';

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

// Mock coverage data based on our rules
const COVERAGE = {
  'T1059': 'high',    // Command and Scripting Interpreter
  'T1110': 'medium',  // Brute Force
  'T1134': 'low',     // Access Token Manipulation
  'T1047': 'high',    // WMI
  'T1003': 'critical',// OS Credential Dumping
  'T1547': 'medium',  // Boot or Logon Autostart Execution
  'T1053': 'high',    // Scheduled Task/Job
  'T1562': 'critical',// Impair Defenses
  'T1046': 'low',     // Network Service Discovery
};

export default function MitreMapping() {
  const getCoverageColor = (technique) => {
    const level = COVERAGE[technique];
    switch(level) {
      case 'critical': return 'bg-soc-critical text-white border-soc-critical';
      case 'high': return 'bg-soc-danger border-soc-danger/50';
      case 'medium': return 'bg-soc-warning border-soc-warning/50';
      case 'low': return 'bg-soc-success border-soc-success/50';
      default: return 'bg-soc-panel border-soc-border text-soc-muted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soc-text">MITRE ATT&CK Mapping</h2>
          <p className="text-sm text-soc-muted mt-1">Visualize detection coverage across the ATT&CK matrix</p>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center text-xs text-soc-muted"><div className="w-3 h-3 bg-soc-critical mr-1 rounded"></div> Critical Coverage</div>
          <div className="flex items-center text-xs text-soc-muted ml-3"><div className="w-3 h-3 bg-soc-danger mr-1 rounded"></div> High Coverage</div>
          <div className="flex items-center text-xs text-soc-muted ml-3"><div className="w-3 h-3 bg-soc-warning mr-1 rounded"></div> Medium Coverage</div>
          <div className="flex items-center text-xs text-soc-muted ml-3"><div className="w-3 h-3 bg-soc-panel border border-soc-border mr-1 rounded"></div> No Coverage</div>
        </div>
      </div>

      <div className="overflow-x-auto bg-soc-panel border border-soc-border rounded-lg shadow-xl p-4">
        <div className="flex space-x-2 min-w-max">
          {TACTICS.map(tactic => (
            <div key={tactic.id} className="w-48 flex-shrink-0 flex flex-col space-y-2">
              <div className="bg-soc-bg border-t-2 border-soc-primary p-3 rounded font-semibold text-sm text-center shadow-lg">
                {tactic.name}
              </div>
              {tactic.techniques.map(technique => (
                <div 
                  key={technique} 
                  className={`p-2 rounded text-xs border cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-between ${getCoverageColor(technique)}`}
                  title={`Technique ${technique}`}
                >
                  <span className="font-mono">{technique}</span>
                  {COVERAGE[technique] && <Target size={12} />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-soc-panel border border-soc-border p-6 rounded-lg">
             <h3 className="font-bold flex items-center mb-4"><Shield className="mr-2 text-soc-primary" size={20}/> Coverage Summary</h3>
             <ul className="space-y-2 text-sm text-soc-muted">
                <li className="flex justify-between border-b border-soc-border pb-1"><span>Total Techniques Covered</span> <span className="text-soc-text font-bold text-lg">{Object.keys(COVERAGE).length}</span></li>
                <li className="flex justify-between border-b border-soc-border pb-1"><span>Critical High-Priority Coverage</span> <span className="text-soc-text font-bold text-lg">2</span></li>
                <li className="flex justify-between border-b border-soc-border pb-1"><span>Active Rules Mapped</span> <span className="text-soc-text font-bold text-lg">14</span></li>
             </ul>
          </div>
       </div>
    </div>
  );
}

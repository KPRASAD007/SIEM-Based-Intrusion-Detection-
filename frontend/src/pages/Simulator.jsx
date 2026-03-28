import React, { useState, useEffect } from 'react';
import { Shield, Zap, Terminal, CheckCircle } from 'lucide-react';

export default function Simulator() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:8080/api/simulator/scenarios`)
      .then(res => res.json())
      .then(data => {
        setScenarios(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("SIMULATOR_SYNC_FAILURE:", err);
        setLoading(false); // Clear loading even on error
      });
  }, []);

  const runScenario = (id) => {
    setRunning(id);
    setResult(null);
    fetch(`http://${window.location.hostname}:8080/api/simulator/run/${id}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setRunning(null);
        setResult({ id, status: data.status, message: data.message });
        setTimeout(() => setResult(null), 5000);
      })
      .catch(err => {
        setRunning(null);
        setResult({ id, status: 'error', message: 'Failed to run simulation' });
      });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center">
            <Zap className="mr-4 text-soc-warning animate-pulse" size={36} /> LIVE_FIRE_SIM
          </h2>
          <p className="text-[10px] font-bold text-soc-muted tracking-[0.4em] mt-3">ADVERSARY EMULATION & SIGNAL INJECTION LABORATORY</p>
        </div>
        <div className="px-6 py-3 bg-soc-critical/10 border-2 border-soc-critical/30 text-soc-critical rounded-xl flex items-center text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.1)] italic">
          <Terminal size={14} className="mr-3" /> RESTRICTED_OPERATIONS_ZONE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 border-4 border-soc-primary/20 border-t-soc-primary rounded-full animate-spin"></div>
             <p className="text-[10px] font-black text-soc-primary uppercase tracking-[0.3em] animate-pulse">Syncing_Scenario_Database...</p>
          </div>
        ) : (
          scenarios.map(scenario => (
            <div key={scenario.id} className="group bg-soc-panel/40 backdrop-blur-xl border-2 border-soc-border rounded-[2rem] shadow-2xl hover:border-soc-primary transition-all duration-500 flex flex-col overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-soc-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="p-8 flex-1 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-soc-bg px-4 py-1.5 rounded-xl text-[10px] font-black text-soc-primary border-2 border-soc-primary/20 uppercase tracking-widest italic">
                    {scenario.mitre}
                  </div>
                  <Shield size={24} className="text-soc-muted opacity-30 group-hover:opacity-100 group-hover:text-soc-primary transition-all duration-500" />
                </div>
                <h3 className="font-black text-xl text-white leading-tight uppercase italic tracking-tighter group-hover:translate-x-1 transition-transform">{scenario.name}</h3>
                <div className="mt-4 h-1 w-12 bg-soc-primary/30 group-hover:w-full transition-all duration-700"></div>
              </div>

              <div className="p-8 bg-soc-bg/50 border-t-2 border-soc-border relative z-10">
                <button 
                  onClick={() => runScenario(scenario.id)}
                  disabled={running === scenario.id}
                  className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center text-xs font-black uppercase tracking-[0.2em] transition-all italic border-2
                    ${running === scenario.id ? 
                      'bg-soc-bg border-soc-border text-soc-muted cursor-not-allowed' : 
                      'bg-soc-primary/10 border-soc-primary/30 text-soc-primary hover:bg-soc-primary hover:text-soc-bg shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                    }`}
                >
                  {running === scenario.id ? (
                    <><div className="w-4 h-4 border-2 border-soc-muted border-t-white rounded-full animate-spin mr-3"></div> INJECTION_PROGRESS...</>
                  ) : (
                    <><Zap size={16} className="mr-3" /> INITIALIZE_INJECT</>
                  )}
                </button>
                {result && result.id === scenario.id && (
                  <div className={`mt-4 text-[10px] p-4 rounded-xl flex items-center font-black uppercase tracking-widest border-2 animate-in slide-in-from-top-2
                    ${result.status === 'success' ? 'bg-soc-primary/5 text-soc-primary border-soc-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-soc-critical/5 text-soc-critical border-soc-critical/20'}`}>
                    <CheckCircle size={14} className="mr-3 shrink-0" /> {result.message}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Tactical Webhook Injector */}
        <div className="group bg-soc-panel/40 backdrop-blur-xl border-4 border-soc-critical/20 rounded-[2rem] shadow-2xl hover:border-soc-critical transition-all duration-500 flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-soc-critical/5 to-transparent opacity-30 group-hover:opacity-60 transition-opacity"></div>
          
          <div className="p-8 flex-1 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-soc-bg px-4 py-1.5 rounded-xl text-[10px] font-black text-soc-critical border-2 border-soc-critical/40 uppercase tracking-widest italic animate-pulse">
                EXTERNAL.SIGNAL_HOOK
              </div>
              <Terminal size={24} className="text-soc-critical opacity-50" />
            </div>
            <h3 className="font-black text-2xl text-white leading-tight uppercase italic tracking-tighter">CALDERA_AGENT_MOCK</h3>
            <p className="text-[10px] text-soc-muted font-bold mt-4 leading-relaxed uppercase opacity-60">BROADCAST_SIMULATED_C2_SIGNAL. BYPASS_UAC_SEQUENCE_TRIGGER_ON_ENDPOINT_TELEMETRY.</p>
          </div>

          <div className="p-8 bg-soc-bg border-t-4 border-soc-critical/20 relative z-10">
            <button 
              onClick={() => {
                setRunning('caldera');
                setResult(null);
                fetch(`http://${window.location.hostname}:8080/api/logs/caldera`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    "paw": "AGENT-WIN10-CALDERA",
                    "contact": "10.0.0.104",
                    "ability": {
                        "name": "Bypass UAC Via SLUI",
                        "tactic": "privilege-escalation",
                        "technique_id": "T1548.002"
                    },
                    "command": "C:\\Windows\\System32\\slui.exe"
                  })
                })
                .then(res => res.json())
                .then(data => {
                  setRunning(null);
                  setResult({ id: 'caldera', status: data.status, message: data.message });
                  setTimeout(() => setResult(null), 5000);
                })
                .catch(err => {
                  setRunning(null);
                  setResult({ id: 'caldera', status: 'error', message: 'INJECTION_FAILURE_RETRY' });
                  setTimeout(() => setResult(null), 5000);
                });
              }}
              disabled={running === 'caldera'}
              className={`w-full py-5 px-6 rounded-2xl flex items-center justify-center text-xs font-black uppercase tracking-[0.3em] transition-all italic border-4
                ${running === 'caldera' ? 
                  'bg-soc-bg border-soc-border text-soc-muted cursor-not-allowed' : 
                  'bg-soc-critical border-soc-critical text-soc-bg hover:bg-soc-bg hover:text-soc-critical shadow-[0_0_50px_rgba(239,68,68,0.4)] hover:shadow-none'
                }`}
            >
              {running === 'caldera' ? (
                <><div className="w-5 h-5 border-2 border-soc-bg/30 border-t-soc-bg rounded-full animate-spin mr-3"></div> DISPATCHING_PAYLOAD...</>
              ) : (
                <><Zap size={18} className="mr-3" /> FIRE_TACTICAL_SIGNAL</>
              )}
            </button>
            {result && result.id === 'caldera' && (
              <div className={`mt-5 text-[10px] p-5 rounded-2xl flex items-center font-black uppercase tracking-widest border-2 shadow-2xl animate-in fade-in duration-500
                ${result.status === 'success' ? 'bg-soc-primary/10 text-soc-primary border-soc-primary/30' : 'bg-soc-critical/10 text-soc-critical border-soc-critical/30'}`}>
                <CheckCircle size={16} className="mr-3 shrink-0" /> {result.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soc-text">Adversary Emulation</h2>
          <p className="text-sm text-soc-muted mt-1">Generate synthetic logs to test detection rules</p>
        </div>
        <div className="px-4 py-2 bg-soc-danger/10 border border-soc-danger/30 text-soc-danger rounded flex items-center text-sm shadow-lg shadow-soc-danger/5">
          <Terminal size={16} className="mr-2" /> Live Fire Environment
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-soc-muted p-4">Loading scenarios...</div>
        ) : (
          scenarios.map(scenario => (
            <div key={scenario.id} className="bg-soc-panel border border-soc-border rounded-lg shadow-lg hover:border-soc-primary/50 transition-colors flex flex-col">
              <div className="p-5 border-b border-soc-border flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-soc-bg px-2 py-1 rounded text-xs font-mono text-soc-primary border border-soc-border">
                    {scenario.mitre}
                  </div>
                  <Shield size={20} className="text-soc-muted" />
                </div>
                <h3 className="font-semibold text-lg text-soc-text leading-tight">{scenario.name}</h3>
              </div>
              <div className="p-4 bg-soc-bg/30">
                <button 
                  onClick={() => runScenario(scenario.id)}
                  disabled={running === scenario.id}
                  className={`w-full py-2 px-4 rounded flex items-center justify-center font-medium transition-colors ${
                    running === scenario.id ? 'bg-soc-border text-soc-muted cursor-not-allowed' : 
                    'bg-soc-primary text-white hover:bg-blue-600 shadow-lg shadow-soc-primary/20'
                  }`}
                >
                  {running === scenario.id ? (
                    <><span className="animate-spin mr-2">⚙</span> Injecting Logs...</>
                  ) : (
                    <><Zap size={16} className="mr-2" /> Execute Simulation</>
                  )}
                </button>
                {result && result.id === scenario.id && (
                  <div className={`mt-3 text-xs p-2 rounded flex items-center ${result.status === 'success' ? 'bg-soc-success/10 text-soc-success border border-soc-success/30' : 'bg-soc-danger/10 text-soc-danger border border-soc-danger/30'}`}>
                    <CheckCircle size={14} className="mr-1.5" /> {result.message}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* ------------------------------------- */}
        {/* Manual Caldera Webhook Simulation Tag */}
        {/* ------------------------------------- */}
        <div className="bg-soc-panel border border-soc-border rounded-lg shadow-lg hover:border-[#991B1B]/50 transition-colors flex flex-col">
          <div className="p-5 border-b border-soc-border flex-1">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-soc-bg px-2 py-1 rounded text-xs font-mono text-[#EF4444] border border-[#991B1B]/50">
                EXTERNAL.WEBHOOK
              </div>
              <Terminal size={20} className="text-[#EF4444]" />
            </div>
            <h3 className="font-semibold text-lg text-soc-text leading-tight">Mock MITRE Caldera Execution</h3>
            <p className="text-xs text-soc-muted mt-2">Trigger a remote HTTP POST to /api/logs/caldera mimicking an incoming hook from a Caldera Agent.</p>
          </div>
          <div className="p-4 bg-soc-bg/30">
            <button 
              onClick={() => {
                setRunning('caldera');
                setResult(null);
                    fetch(`http://${window.location.hostname}:8080/api/logs/caldera`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    "paw": "AGENT-WIN10-XYZ",
                    "contact": "192.168.1.104",
                    "ability": {
                        "name": "Bypass UAC",
                        "tactic": "privilege-escalation",
                        "technique_id": "T1548.002"
                    },
                    "command": "C:\\Windows\\System32\\cmd.exe /c start C:\\Temp\\payload.exe"
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
                  setResult({ id: 'caldera', status: 'error', message: 'Failed to dispatch webhook' });
                  setTimeout(() => setResult(null), 5000);
                });
              }}
              disabled={running === 'caldera'}
              className={`w-full py-2 px-4 rounded flex items-center justify-center font-medium transition-colors ${
                running === 'caldera' ? 'bg-soc-border text-soc-muted cursor-not-allowed' : 
                'bg-[#991B1B] text-white hover:bg-red-700 shadow-lg shadow-[#991B1B]/20'
              }`}
            >
              {running === 'caldera' ? (
                <><span className="animate-spin mr-2">⚙</span> Dispatching...</>
              ) : (
                <><Zap size={16} className="mr-2" /> Fire Webhook Payload</>
              )}
            </button>
            {result && result.id === 'caldera' && (
              <div className={`mt-3 text-xs p-2 rounded flex items-center shadow-lg ${result.status === 'success' ? 'bg-soc-success/10 text-soc-success border border-soc-success/30' : 'bg-soc-danger/10 text-soc-danger border border-soc-danger/30'}`}>
                <CheckCircle size={14} className="mr-1.5" /> {result.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

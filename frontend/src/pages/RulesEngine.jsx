import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Info, ChevronDown, ChevronRight, Activity, Target, CheckCircle, XCircle, FileText, X } from 'lucide-react';

export default function RulesEngine() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSigmaModal, setShowSigmaModal] = useState(false);
  const [sigmaContent, setSigmaContent] = useState('');
  const [importingSigma, setImportingSigma] = useState(false);
  const [expandedRule, setExpandedRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: '', description: '', field: 'process_name', operator: 'equals', value: '', severity: 'high', mitre_attack_id: 'T1000'
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = () => {
    fetch(`http://${window.location.hostname}:8080/api/rules`)
      .then(res => res.json())
      .then(data => {
        setRules(data);
        setLoading(false);
      });
  };

  const toggleRule = (id, e) => {
    e.stopPropagation();
    fetch(`http://${window.location.hostname}:8080/api/rules/${id}/toggle`, { method: 'PUT' })
      .then(() => fetchRules());
  };

  const deleteRule = (id, e) => {
    e.stopPropagation();
    fetch(`http://${window.location.hostname}:8080/api/rules/${id}`, { method: 'DELETE' })
      .then(() => fetchRules());
  };

  const handleCreateRule = (e) => {
    e.preventDefault();
    fetch(`http://${window.location.hostname}:8080/api/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRule)
    }).then(() => {
      setShowModal(false);
      fetchRules();
    });
  };

  const handleSigmaImport = (e) => {
    e.preventDefault();
    setImportingSigma(true);
    fetch(`http://${window.location.hostname}:8080/api/sigma/convert?rule_yaml=${encodeURIComponent(sigmaContent)}`, {
      method: 'POST'
    }).then(res => res.json())
      .then(() => {
        setShowSigmaModal(false);
        setSigmaContent('');
        setImportingSigma(false);
        fetchRules();
      }).catch(err => {
        console.error(err);
        setImportingSigma(false);
      });
  };
  
  const toggleExpand = (id) => {
    if (expandedRule === id) {
      setExpandedRule(null);
    } else {
      setExpandedRule(id);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-8">
        <div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center">
             <Settings className="mr-4 text-soc-primary" size={36} /> DETECTION_ENGINE_V1
           </h2>
           <p className="text-[10px] font-bold text-soc-muted tracking-[0.4em] mt-3">MANAGEMENT & ORCHESTRATION OF ADVERSARIAL SIGNAL LOGIC</p>
        </div>
        <div className="flex space-x-4 self-start">
           <button 
             onClick={() => setShowSigmaModal(true)}
             className="px-8 py-3.5 bg-soc-bg border-2 border-soc-border text-soc-muted hover:border-soc-primary hover:text-white transition-all text-xs font-black uppercase tracking-widest italic flex items-center shadow-xl"
           >
             <FileText size={18} className="mr-2" /> IMPORT_SIGMA
           </button>
           <button 
             onClick={() => setShowModal(true)}
             className="px-8 py-3.5 bg-soc-primary text-soc-bg rounded-xl hover:bg-soc-hacker transition-all text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] italic flex items-center"
           >
             <Plus size={18} className="mr-2" /> INITIALIZE_NEW_RULE
           </button>
        </div>
      </div>

      <div className="bg-soc-panel/40 backdrop-blur-xl border-2 border-soc-border rounded-[2rem] shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none"></div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-soc-bg text-soc-muted border-b-2 border-soc-border uppercase tracking-[0.2em] font-black italic">
              <tr>
                <th className="px-6 py-5 w-10"></th>
                <th className="px-8 py-5 font-black text-[10px]">Signal_Sync</th>
                <th className="px-8 py-5 font-black text-[10px]">Registry_DNAME</th>
                <th className="px-8 py-5 font-black text-[10px]">Criticality</th>
                <th className="px-8 py-5 font-black text-[10px]">Mitre_ID</th>
                <th className="px-8 py-5 font-black text-[10px] text-right">Ops_Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border">
              {loading ? (
                 <tr><td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                       <Activity className="text-soc-primary animate-spin" size={32} />
                       <p className="text-[10px] font-black text-soc-primary uppercase tracking-[0.3em] animate-pulse">Syncing_Ruleset_Core...</p>
                    </div>
                 </td></tr>
              ) : rules.length === 0 ? (
                 <tr><td colSpan="6" className="px-8 py-24 text-center">
                    <Settings size={60} className="mx-auto mb-4 text-soc-muted opacity-20" />
                    <p className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">ZERO_SIGNALS_DEFINED</p>
                    <p className="text-xs text-soc-muted font-bold tracking-widest uppercase italic">THE_ENGINE_IS_SITTING_IDLE</p>
                 </td></tr>
              ) : rules.map(rule => (
                <React.Fragment key={rule.id}>
                  <tr 
                    onClick={() => toggleExpand(rule.id)}
                    className={`hover:bg-soc-bg/60 cursor-pointer transition-all duration-300 group ${!rule.is_active ? 'opacity-40 grayscale' : ''} ${expandedRule === rule.id ? 'bg-soc-bg/40' : ''}`}
                  >
                    <td className="px-6 py-5 text-soc-muted">
                      <div className={`transition-transform duration-500 ${expandedRule === rule.id ? 'rotate-90 text-soc-primary' : ''}`}>
                         <ChevronRight size={20} />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <button 
                        onClick={(e) => toggleRule(rule.id, e)} 
                        className={`flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black transition-all border-2 uppercase tracking-widest italic
                          ${rule.is_active ? 'bg-soc-primary/10 text-soc-primary border-soc-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-soc-bg border-soc-border text-soc-muted'}`}
                      >
                        {rule.is_active ? (
                          <><CheckCircle size={14} className="mr-2" /> LIVE_SYNC</>
                        ) : (
                          <><XCircle size={14} className="mr-2" /> OFFLINE</>
                        )}
                      </button>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-black text-white italic text-base tracking-tight group-hover:text-soc-primary transition-colors uppercase">{rule.name}</div>
                      <div className="text-[9px] text-soc-muted font-mono mt-1 opacity-50 uppercase tracking-tighter">ID: {rule.id.slice(-8)}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black italic border-2 uppercase tracking-widest
                        ${rule.severity === 'critical' ? 'text-soc-critical border-soc-critical/40 bg-soc-critical/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 
                          rule.severity === 'high' ? 'text-soc-warning border-soc-warning/40 bg-soc-warning/5' : 
                          'text-soc-secondary border-soc-secondary/40 bg-soc-secondary/5'}`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center text-soc-primary font-mono font-black text-xs space-x-2">
                          <Target size={14} className="opacity-40" />
                          <span>{rule.mitre_attack_id}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={(e) => deleteRule(rule.id, e)} className="p-3 text-soc-muted hover:text-white hover:bg-soc-critical bg-soc-bg/50 rounded-xl transition-all border border-soc-border hover:border-soc-critical shadow-xl">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                  {expandedRule === rule.id && (
                    <tr className="bg-soc-bg/30 animate-in slide-in-from-top-4 duration-500">
                      <td colSpan="6" className="px-12 py-12 whitespace-normal border-b-2 border-soc-border">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          <div className="space-y-8">
                             <div className="space-y-4">
                               <h4 className="text-[10px] font-black text-soc-primary uppercase tracking-[0.4em] flex items-center italic">
                                 <Info size={16} className="mr-3" /> BEHAVIORAL_BREAKDOWN
                               </h4>
                               <div className="bg-soc-bg border-2 border-soc-border p-8 rounded-[1.5rem] relative overflow-hidden group/text">
                                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/text:opacity-20 transition-opacity pointer-events-none">
                                     <FileText size={80} />
                                  </div>
                                  <p className="text-sm text-soc-text font-bold italic leading-relaxed opacity-90">"{rule.description}"</p>
                               </div>
                             </div>
                             
                             <div className="space-y-4">
                               <h4 className="text-[10px] font-black text-soc-secondary uppercase tracking-[0.4em] flex items-center italic">
                                 <Target size={16} className="mr-3" /> ADVERSARIAL_INTENT_MAPPING
                               </h4>
                               <div className="bg-soc-bg border-2 border-soc-border p-8 rounded-[1.5rem] flex items-center space-x-6 backdrop-blur-xl">
                                  <div className="p-4 bg-soc-secondary/10 rounded-2xl border-2 border-soc-secondary/20 text-soc-secondary">
                                     <Target size={32} />
                                  </div>
                                  <div>
                                     <p className="text-xs text-white font-black italic uppercase tracking-widest mb-1">MITRE_TECHNIQUE: <span className="text-soc-secondary">{rule.mitre_attack_id}</span></p>
                                     <p className="text-[10px] text-soc-muted font-bold leading-relaxed uppercase opacity-60">CORRELATED SIGNAL DETECTED IN LOG_TELEMETRY. REACT IMMEDIATELY IF SIGNAL TRIGGERED ON CRITICAL ASSETS.</p>
                                  </div>
                               </div>
                             </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-soc-warning uppercase tracking-[0.4em] flex items-center italic">
                              <Activity size={16} className="mr-3" /> ENGINE_MATCHER_LOGIC_PREVIEW
                            </h4>
                            <div className="bg-[#0b0e14] p-10 rounded-[2rem] border-2 border-soc-border font-mono text-sm relative group/code overflow-hidden shadow-2xl">
                              <div className="absolute top-4 right-4 text-[9px] font-black text-soc-muted/30 uppercase tracking-widest italic">SYSMON_DSL_V1.2</div>
                              <div className="space-y-2">
                                <div className="flex">
                                  <span className="text-soc-muted opacity-30 select-none mr-8">01</span>
                                  <p className="text-soc-text"><span className="text-[#c678dd]">rule</span> <span className="text-[#61afef]">{rule.name.replace(/\s+/g, '_')}</span> {'{'}</p>
                                </div>
                                <div className="flex">
                                  <span className="text-soc-muted opacity-30 select-none mr-8">02</span>
                                  <p className="text-soc-text ml-6">condition:</p>
                                </div>
                                <div className="flex">
                                  <span className="text-soc-muted opacity-30 select-none mr-8">03</span>
                                  <p className="text-soc-text ml-12">log.<span className="text-[#d19a66]">{rule.field}</span> <span className="text-[#56b6c2]">{rule.operator === 'equals' ? '==' : rule.operator}</span> <span className="text-[#98c379]">"{rule.value}"</span></p>
                                </div>
                                <div className="flex">
                                  <span className="text-soc-muted opacity-30 select-none mr-8">04</span>
                                  <p className="text-soc-text ml-6">action:</p>
                                </div>
                                <div className="flex">
                                  <span className="text-soc-muted opacity-30 select-none mr-8">05</span>
                                  <p className="text-soc-text ml-12"><span className="text-[#e06c75]">emit_alert</span>(severity=<span className="text-[#98c379]">"{rule.severity}"</span>)</p>
                                </div>
                                <div className="flex">
                                  <span className="text-soc-muted opacity-30 select-none mr-8">06</span>
                                  <p className="text-soc-text">{'}'}</p>
                                </div>
                              </div>
                              <div className="absolute bottom-4 right-6 flex space-x-4 opacity-50">
                                 <div className="w-2 h-2 rounded-full bg-[#e06c75]"></div>
                                 <div className="w-2 h-2 rounded-full bg-[#d19a66]"></div>
                                 <div className="w-2 h-2 rounded-full bg-[#98c379]"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-soc-bg/95 backdrop-blur-3xl flex items-center justify-center z-[200] p-4">
          <div className="bg-soc-panel border-4 border-soc-border rounded-[3rem] p-12 w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-soc-primary"></div>
            
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center space-x-4">
                 <div className="p-4 bg-soc-primary/10 rounded-2xl text-soc-primary border-2 border-soc-primary/20 shadow-xl">
                   <Settings size={28} />
                 </div>
                 <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">RULE_DEFINITION_INTERFACE</h3>
               </div>
               <button onClick={() => setShowModal(false)} className="p-3 bg-soc-bg border-2 border-soc-border text-white rounded-2xl hover:border-soc-critical hover:text-soc-critical transition-all">
                 <X size={24} />
               </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-soc-muted uppercase tracking-[0.4em] ml-1">Registry_Name</label>
                  <input required type="text" className="w-full bg-soc-bg border-2 border-soc-border rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-soc-primary transition-all italic tracking-tight" 
                    placeholder="THREAT_SIGNAL_ALPHA_V1"
                    value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-soc-muted uppercase tracking-[0.4em] ml-1">Mitre_Attack_ID</label>
                  <input required type="text" placeholder="T1000" className="w-full bg-soc-bg border-2 border-soc-border rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-soc-primary transition-all font-mono uppercase" 
                    value={newRule.mitre_attack_id} onChange={e => setNewRule({...newRule, mitre_attack_id: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-soc-muted uppercase tracking-[0.4em] ml-1">Behavioral_Forensic_Description</label>
                <textarea required className="w-full bg-soc-bg border-2 border-soc-border rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-soc-primary transition-all italic min-h-[100px] resize-none" 
                  placeholder="Describe the TTP being detected..."
                 value={newRule.description} onChange={e => setNewRule({...newRule, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-soc-muted uppercase tracking-[0.4em] ml-1">Field_Telemetry</label>
                  <select className="w-full bg-soc-bg border-2 border-soc-border rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-soc-primary appearance-none cursor-pointer italic"
                    value={newRule.field} onChange={e => setNewRule({...newRule, field: e.target.value})}>
                    <option value="process_name">PROCESS_IMAGE</option>
                    <option value="event_id">WIN_EVENT_ID</option>
                    <option value="ip_address">NETWORK_SIGNAL_IP</option>
                    <option value="command_line">CLI_PAYLOAD</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-soc-muted uppercase tracking-[0.4em] ml-1">Evaluation_Op</label>
                  <select className="w-full bg-soc-bg border-2 border-soc-border rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-soc-primary appearance-none cursor-pointer italic"
                    value={newRule.operator} onChange={e => setNewRule({...newRule, operator: e.target.value})}>
                    <option value="equals">EXACT_MATCH</option>
                    <option value="contains">PARTIAL_STRING</option>
                    <option value="regex">G_REGEX_MATCH</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-soc-muted uppercase tracking-[0.4em] ml-1">Target_Token</label>
                  <input required type="text" placeholder="Value..." className="w-full bg-soc-bg border-2 border-soc-border rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-soc-primary transition-all font-mono" 
                    value={newRule.value} onChange={e => setNewRule({...newRule, value: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-soc-muted uppercase tracking-[0.4em] ml-1">Priority_Vector</label>
                <div className="grid grid-cols-4 gap-4">
                   {['low', 'medium', 'high', 'critical'].map(sev => (
                      <button 
                        key={sev}
                        type="button"
                        onClick={() => setNewRule({...newRule, severity: sev})}
                        className={`py-3 px-2 rounded-xl text-[9px] font-black border-2 transition-all uppercase tracking-widest italic
                           ${newRule.severity === sev ? (
                              sev === 'critical' ? 'bg-soc-critical text-white border-soc-critical shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
                              sev === 'high' ? 'bg-soc-warning text-soc-bg border-soc-warning shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                              'bg-soc-primary text-soc-bg border-soc-primary'
                           ) : 'bg-soc-bg border-soc-border text-soc-muted hover:border-white'}`}
                      >
                         {sev}
                      </button>
                   ))}
                </div>
              </div>

              <div className="flex space-x-6 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-soc-panel border-2 border-soc-border rounded-2xl text-xs font-black uppercase tracking-widest italic hover:border-white transition-all">ABORT_CHANGES</button>
                <button type="submit" className="flex-1 py-5 bg-soc-primary text-soc-bg rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-[1.03] active:scale-95 transition-all italic">COMMIT_ENGINE_LOGIC</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showSigmaModal && (
        <div className="fixed inset-0 bg-soc-bg/95 backdrop-blur-3xl flex items-center justify-center z-[200] p-4">
          <div className="bg-soc-panel border-4 border-soc-border rounded-[3rem] p-12 w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-soc-primary"></div>
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center space-x-4">
                 <div className="p-4 bg-soc-primary/10 rounded-2xl text-soc-primary border-2 border-soc-primary/20 shadow-xl">
                   <FileText size={28} />
                 </div>
                 <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">SIGMA_CONVERTER_V1</h3>
               </div>
               <button onClick={() => setShowSigmaModal(false)} className="p-3 bg-soc-bg border-2 border-soc-border text-white rounded-2xl hover:border-soc-critical hover:text-soc-critical transition-all">
                 <X size={24} />
               </button>
            </div>
            <form onSubmit={handleSigmaImport} className="space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-soc-muted uppercase tracking-[0.4em] ml-1">SIGMA_YAML_SOURCE</label>
                  <textarea 
                    required 
                    className="w-full bg-soc-bg border-2 border-soc-border rounded-2xl p-6 text-[11px] font-mono text-soc-primary focus:outline-none focus:border-soc-primary transition-all min-h-[300px] resize-none scrollbar-hide" 
                    placeholder="title: Suspicious Process Execution...
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    Image|ends_with: '\mimikatz.exe'
  condition: selection"
                    value={sigmaContent} 
                    onChange={e => setSigmaContent(e.target.value)} 
                  />
               </div>
               <div className="flex space-x-6">
                 <button type="button" onClick={() => setShowSigmaModal(false)} className="flex-1 py-5 bg-soc-panel border-2 border-soc-border rounded-2xl text-xs font-black uppercase tracking-widest italic hover:border-white transition-all">ABORT</button>
                 <button 
                   type="submit" 
                   disabled={importingSigma}
                   className="flex-1 py-5 bg-soc-primary text-soc-bg rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-[1.03] active:scale-95 transition-all italic disabled:opacity-50"
                 >
                   {importingSigma ? 'CONVERTING...' : 'INITIALIZE_SIGMA_RULE'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

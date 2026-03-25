import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, User, MessageSquare, Clock, X, CheckCircle, AlertCircle, Plus, Send, Shield, Activity, Target, ShieldCheck, Info, Terminal, AlertTriangle, Search, Trash2, ChevronRight, BookOpen, Fingerprint, Download, Share2 } from 'lucide-react';
import KillChainVisualization from '../components/KillChainVisualization';

const ATTACK_PLAYBOOKS = {
  recon: {
    title: "Reconnaissance Response",
    steps: ["Identify Source IP of scans", "Check firewall blocklists", "Verify external exposure of affected ports"],
    priority: "Monitor"
  },
  weaponization: {
    title: "Weaponization Triage",
    steps: ["Scan host for dropped artifacts", "Analyze file entropy", "Check email gateway for suspicious attachments"],
    priority: "Investigate"
  },
  delivery: {
    title: "Delivery Containment",
    steps: ["Quarantine suspicious files", "Reset user credentials if phishing suspected", "Search for similar artifacts across fleet"],
    priority: "Urgent"
  },
  exploitation: {
    title: "Exploitation Mitigation",
    steps: ["Isolate host from network", "Kill parent process subtree", "Snapshot memory for forensic analysis"],
    priority: "CRITICAL"
  },
  installation: {
    title: "Persistence Removal",
    steps: ["Audit Scheduled Tasks/RegKeys", "Inspect newly created services", "Check for DLL hijacking signatures"],
    priority: "CRITICAL"
  },
  c2: {
    title: "C2 Signal Analysis",
    steps: ["Block C2 IP/Domain at Perimeter", "Analyze beaconing interval", "Check for encrypted tunnels (VPN/DNS)"],
    priority: "IMMEDIATE"
  },
  actions: {
    title: "Impact & Exfiltration Analysis",
    steps: ["Audit Data Access Logs", "Identify data staging directories", "Initiate legal/compliance notification"],
    priority: "CATASTROPHIC"
  }
};

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCaseData, setNewCaseData] = useState({
    title: '',
    severity: 'medium',
    analyst_assigned: 'SOC Analyst',
  });
  const [creatingCase, setCreatingCase] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isNotesMinimized, setIsNotesMinimized] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = () => {
    setLoading(true);
    fetch(`http://${window.location.hostname}:8080/api/incidents`)
      .then(res => res.json())
      .then(data => {
        setIncidents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching incidents:", err);
        setLoading(false);
      });
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newCaseData.title.trim()) return;
    setCreatingCase(true);
    try {
      const payload = {
        ...newCaseData,
        case_id: "PENDING",
        status: "open",
        alerts_linked: [],
        notes: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const res = await fetch(`http://${window.location.hostname}:8080/api/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewCaseData({ title: '', severity: 'medium', analyst_assigned: 'SOC Analyst' });
        fetchIncidents();
      }
    } catch (err) {
      console.error("Failed to create case", err);
    }
    setCreatingCase(false);
  };

  const openCaseDetails = (inc) => {
    setSelectedCase(inc);
    setAiAnalysis(null);
  };

  const runAIAnalysis = async () => {
    if (!selectedCase) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/incidents/${selectedCase.id}/ai-analyze`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    }
    setIsAnalyzing(false);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/alerts/${id}/status?status=${newStatus}`, {
        method: 'PUT'
      });
      if (res.ok) {
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc));
        if (selectedCase?.id === id) setSelectedCase({ ...selectedCase, status: newStatus });
      }
    } catch (err) { console.error(err); }
  };

  const submitNote = async () => {
    if (!newNote.trim() || !selectedCase) return;
    setSubmittingNote(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/incidents/${selectedCase.id}/notes?note_content=${encodeURIComponent(newNote)}`, {
        method: 'PUT'
      });
      if (res.ok) {
        const addedNote = await res.json();
        const updatedCase = { ...selectedCase, notes: [...(selectedCase.notes || []), addedNote] };
        setSelectedCase(updatedCase);
        setIncidents(prev => prev.map(inc => inc.id === selectedCase.id ? updatedCase : inc));
        setNewNote('');
      }
    } catch (err) { console.error(err); }
    setSubmittingNote(false);
  };

  const getTacticsFromMapping = (mappings) => {
    if (!mappings) return [];
    const techToTactic = {
      'T1003': 'TA0006', 'T1110': 'TA0006', 'T1047': 'TA0008', 'T1059': 'TA0002',
      'T1547': 'TA0003', 'T1053': 'TA0003', 'T1562': 'TA0005', 'T1105': 'TA0001',
      'T1041': 'TA0010', 'T1486': 'TA0040', 'T1548': 'TA0004'
    };
    const tactics = new Set();
    mappings.forEach(m => {
      const tid = m.match(/T\d+/)?.[0];
      if (tid && techToTactic[tid]) tactics.add(techToTactic[tid]);
    });
    return Array.from(tactics);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-8">
        <div>
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center">
             <Briefcase className="mr-4 text-soc-secondary" size={36} /> CASE_MANAGEMENT_V2
           </h2>
           <p className="text-[10px] font-bold text-soc-muted tracking-[0.4em] mt-3">TACTICAL INCIDENT TRIAGE & FORENSIC ORCHESTRATION</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-8 py-3.5 bg-soc-secondary text-soc-bg rounded-xl hover:bg-soc-primary transition-all text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(59,130,246,0.3)] italic flex items-center self-start"
        >
          <Plus size={18} className="mr-2" /> CREATE_NEW_DOCKET
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-soc-panel/20 rounded-[2rem] border-2 border-soc-border border-dashed col-span-full">
            <div className="w-12 h-12 border-4 border-soc-secondary/10 border-t-soc-secondary rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-bold text-soc-secondary tracking-[0.4em] uppercase animate-pulse italic">COLLECTING_EVIDENCE_PACKETS...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-soc-panel/40 backdrop-blur-xl border-2 border-soc-border p-20 rounded-[2.5rem] text-center col-span-full shadow-2xl relative overflow-hidden">
             <Briefcase size={80} className="mx-auto mb-6 text-soc-muted opacity-20" />
             <p className="text-2xl font-black text-white tracking-tight uppercase italic mb-2">OPERATIONAL_QUIET_ZONE</p>
             <p className="text-xs text-soc-muted font-bold tracking-widest uppercase italic">NO_ACTIVE_INCIDENTS_IN_QUEUE</p>
          </div>
        ) : (
          incidents.map(inc => (
            <div key={inc.id} className="bg-soc-panel/40 backdrop-blur-lg border-2 border-soc-border rounded-[2rem] shadow-xl hover:bg-soc-bg/60 transition-all group overflow-hidden flex flex-col hover:border-soc-secondary/50 duration-500">
              <div className="p-8 border-b border-soc-border relative">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-mono font-black border border-soc-border px-3 py-1 rounded-lg text-soc-muted tracking-widest bg-soc-bg/50">ID_//_{inc.case_id}</span>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest italic border ${inc.severity === 'critical' ? 'text-soc-critical bg-soc-critical/5 border-soc-critical/30' : 'text-soc-secondary bg-soc-secondary/5 border-soc-secondary/30'}`}>{inc.severity.toUpperCase()}</span>
                </div>
                <h3 className="text-xl font-black text-white italic tracking-tight group-hover:text-soc-secondary transition-colors truncate" title={inc.title}>{inc.title}</h3>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-white italic">
                   <div className="flex items-center"><User size={14} className="mr-2 text-soc-secondary" /> {inc.analyst_assigned || 'UNASSIGNED'}</div>
                   <div className="flex items-center"><MessageSquare size={14} className="mr-2 text-soc-secondary" /> {inc.notes?.length || 0} UPDATES</div>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.2em] italic border ${inc.status === 'open' ? 'text-soc-primary bg-soc-primary/5 border-soc-primary/30' : 'text-soc-muted bg-soc-bg border-soc-border grayscale opacity-50'}`}>{inc.status.toUpperCase()}</span>
                  <button onClick={() => openCaseDetails(inc)} className="flex items-center text-[10px] font-black italic uppercase tracking-[0.2em] text-soc-secondary hover:text-white transition-all transform hover:translate-x-2">ACCESS_CASE <ChevronRight size={16} className="ml-1" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedCase && createPortal(
        <div className="fixed inset-0 z-[1000] bg-soc-bg/98 flex items-center justify-center p-2 lg:p-12 animate-in fade-in duration-300 backdrop-blur-3xl overflow-hidden">
          <div className="bg-soc-panel border-2 border-soc-border rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-7xl h-full flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 z-10">
               <button onClick={() => setSelectedCase(null)} className="p-4 bg-soc-bg border-2 border-soc-border text-white rounded-2xl hover:border-soc-secondary hover:text-soc-secondary transition-all shadow-2xl"><X size={24} /></button>
            </div>

            <div className="p-10 lg:p-14 border-b-2 border-soc-border bg-soc-bg/40 flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="flex items-start space-x-6">
                <div className="p-5 bg-soc-secondary/10 rounded-[1.5rem] text-soc-secondary border-2 border-soc-secondary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]"><Briefcase size={32} /></div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono font-black text-soc-muted tracking-widest uppercase">DOCKET_//_{selectedCase.case_id}</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest italic border ${selectedCase.severity === 'critical' ? 'bg-soc-critical/10 text-soc-critical border-soc-critical/30' : 'bg-soc-warning/10 text-soc-warning border-soc-warning/30'}`}>Lvl_{selectedCase.severity.toUpperCase()}</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase">{selectedCase.title}</h2>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              <div className="w-full lg:w-1/4 border-b-2 lg:border-b-0 lg:border-r-2 border-soc-border bg-soc-bg/20 p-8 lg:p-10 overflow-y-auto custom-scrollbar space-y-10">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-soc-muted uppercase tracking-[0.4em] italic mb-6">Orchestration</h4>
                  <div className="grid grid-cols-1 gap-3">
                     <button onClick={() => handleStatusUpdate(selectedCase.id, 'open')} className={`py-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest italic ${selectedCase.status === 'open' ? 'bg-soc-primary/10 text-soc-primary border-soc-primary shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-soc-bg border-soc-border text-soc-muted hover:border-white hover:text-white'}`}>OPEN_CASE</button>
                     <button onClick={() => handleStatusUpdate(selectedCase.id, 'closed')} className={`py-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest italic ${selectedCase.status === 'closed' ? 'bg-soc-panel text-white border-soc-border opacity-50' : 'bg-soc-bg border-soc-border text-soc-muted hover:border-soc-primary hover:text-soc-primary'}`}>COMMIT_RESOLVED</button>
                  </div>

                  <div className="pt-8 border-t border-soc-border space-y-4">
                    <button onClick={runAIAnalysis} disabled={isAnalyzing} className={`w-full py-5 rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-3 border-2 uppercase tracking-[0.2em] italic ${isAnalyzing ? 'bg-soc-secondary/10 text-soc-secondary border-soc-secondary animate-pulse' : 'bg-soc-bg border-soc-secondary/40 text-soc-secondary hover:bg-soc-secondary hover:text-soc-bg'}`}>
                      {isAnalyzing ? <><Activity size={18} className="animate-spin" /><span>TRIAGING...</span></> : <><Shield size={18} /><span>L3_AI_ASSISTANT</span></>}
                    </button>
                  </div>
                  
                  {aiAnalysis && (
                     <div className="pt-8 border-t border-soc-border">
                        <p className="text-[9px] text-soc-muted uppercase font-black tracking-widest mb-2">Confidence_Rating</p>
                        <span className={`text-3xl font-black italic ${aiAnalysis.score > 75 ? 'text-soc-critical' : 'text-soc-primary'}`}>{aiAnalysis.score}%</span>
                        <div className="w-full bg-soc-border h-1.5 rounded-full mt-4 overflow-hidden">
                           <div className={`h-full transition-all duration-1000 ${aiAnalysis.score > 75 ? 'bg-soc-critical' : 'bg-soc-primary'}`} style={{ width: `${aiAnalysis.score}%` }}></div>
                        </div>
                     </div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-soc-bg/10 overflow-hidden">
                <div className="flex-1 p-10 lg:p-14 overflow-y-auto custom-scrollbar space-y-12">
                  {aiAnalysis ? (
                    <div className="space-y-12 animate-in fade-in duration-700">
                       <div className="flex items-center justify-between border-b border-soc-border pb-4 w-full">
                          <h4 className="text-[11px] font-black text-soc-primary uppercase tracking-[0.4em] italic flex items-center"><Activity size={18} className="mr-3" /> Tactical_Intelligence_Report</h4>
                          <div className="flex items-center space-x-3">
                             <button className="px-4 py-1.5 bg-soc-bg border border-soc-border rounded-lg text-[9px] font-black text-soc-muted hover:text-white transition-all uppercase italic flex items-center"><Download size={12} className="mr-2" /> Evidence_ZIP</button>
                             <button className="px-4 py-1.5 bg-soc-secondary/10 border border-soc-secondary/30 rounded-lg text-[9px] font-black text-soc-secondary uppercase italic flex items-center"><Share2 size={12} className="mr-2" /> CSIRT_Share</button>
                          </div>
                       </div>
                       
                       <KillChainVisualization activeTactics={getTacticsFromMapping(aiAnalysis.mitre_mapping)} techniques={aiAnalysis.mitre_mapping} />

                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          <div className="bg-soc-panel/40 border-2 border-soc-border p-10 rounded-[2rem] relative overflow-hidden">
                             <h4 className="text-lg font-black text-white italic tracking-tighter uppercase mb-6 flex items-center underline decoration-soc-primary/30 underline-offset-8"><Fingerprint size={20} className="mr-3 text-soc-primary" /> Behavioral_Context</h4>
                             <p className="text-sm text-soc-text leading-relaxed font-medium italic">"{aiAnalysis.technical_summary}"</p>
                          </div>
                          <div className="space-y-8">
                             <div className="bg-soc-panel/40 border-2 border-soc-border p-8 rounded-[2rem]">
                                <h4 className="text-lg font-black text-white italic tracking-tighter uppercase mb-6 flex items-center underline decoration-soc-secondary/30 underline-offset-8"><Target size={20} className="mr-3 text-soc-secondary" /> Mitre_Signature</h4>
                                <div className="flex flex-wrap gap-2 text-[10px] font-black text-soc-secondary uppercase italic">{aiAnalysis.mitre_mapping.map((m, i) => <span key={i} className="px-3 py-1 bg-soc-bg border border-soc-secondary/20 rounded-lg">TID::{m}</span>)}</div>
                             </div>
                             <div className="bg-soc-panel/40 border-2 border-soc-border p-8 rounded-[2rem]">
                                <h4 className="text-lg font-black text-white italic tracking-tighter uppercase mb-6 flex items-center underline decoration-soc-critical/30 underline-offset-8"><AlertTriangle size={20} className="mr-3 text-soc-critical" /> Remediation</h4>
                                <ul className="space-y-3 font-bold text-xs text-soc-text italic uppercase tracking-tight">{aiAnalysis.recommendation.map((rec, i) => <li key={i} className="flex items-start"><div className="w-1.5 h-1.5 rounded-full bg-soc-critical mr-3 mt-1.5 shrink-0"></div>{rec}</li>)}</ul>
                             </div>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <h4 className="text-[11px] font-black text-soc-primary uppercase tracking-[0.4em] italic border-b border-soc-border pb-4">Investigation_Timeline</h4>
                      {(!selectedCase.notes || selectedCase.notes.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-soc-panel/10 rounded-[2rem] border-2 border-dashed border-soc-border">
                          <Clock size={48} className="text-soc-muted opacity-10 mb-6" /><p className="text-xs text-soc-muted font-black uppercase tracking-[0.3em] italic">SIGNAL_SILENCE</p>
                        </div>
                      ) : (
                        <div className="space-y-6 ml-4 pl-10 border-l border-soc-border relative">
                          {selectedCase.notes.map((note, idx) => (
                            <div key={idx} className="bg-soc-panel/30 border-2 border-soc-border rounded-[1.5rem] p-8 relative hover:border-soc-secondary/50 transition-all">
                              <div className="absolute -left-[45px] top-8 w-4 h-4 rounded-full bg-soc-bg border-2 border-soc-secondary"></div>
                              <div className="flex items-center justify-between mb-4 text-[10px] font-black italic uppercase tracking-widest"><span className="text-soc-secondary flex items-center"><User size={14} className="mr-3" /> {note.author}</span><span className="text-soc-muted">{new Date(note.timestamp).toLocaleString()}</span></div>
                              <p className="text-sm font-bold text-soc-text italic opacity-90">"{note.content}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={`transition-all duration-500 bg-soc-bg border-t-2 border-soc-border ${isNotesMinimized ? 'h-16' : 'p-10'}`}>
                  {isNotesMinimized ? (
                    <div className="flex items-center justify-between h-full px-10 text-[10px] font-black uppercase italic tracking-widest text-soc-muted">
                      <span>ADD_CASE_UPDATE (MINIMIZED)</span>
                      <button onClick={() => setIsNotesMinimized(false)} className="px-4 py-2 bg-soc-secondary/10 border border-soc-secondary/30 text-soc-secondary rounded-lg">RESTORE_CMD</button>
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="absolute -top-10 right-0"><button onClick={() => setIsNotesMinimized(true)} className="text-[9px] font-black text-soc-muted hover:text-white uppercase tracking-widest flex items-center bg-soc-bg px-4 py-2 rounded-t-xl border-x border-t border-soc-border">MINIMIZE_TERMINAL <X size={12} className="ml-2" /></button></div>
                      <textarea placeholder="Input Tactical Update..." className="w-full bg-soc-panel border-2 border-soc-border rounded-3xl p-8 pt-6 pb-20 text-sm font-bold text-soc-text focus:outline-none focus:border-soc-secondary transition-all resize-none min-h-[140px] italic shadow-2xl" value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                      <div className="absolute bottom-6 left-8 flex items-center space-x-4"><Terminal size={16} className="text-soc-secondary" /><span className="text-[10px] text-soc-muted uppercase font-black tracking-widest italic opacity-50">CMD_://_ADD_COMMIT</span></div>
                      <button disabled={submittingNote || !newNote.trim()} onClick={submitNote} className="absolute bottom-6 right-8 bg-soc-secondary text-soc-bg p-4 rounded-2xl hover:bg-soc-primary transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-20"><Send size={20} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isCreateModalOpen && createPortal(
        <div className="fixed inset-0 z-[1001] bg-soc-bg/95 flex items-center justify-center p-4">
          <div className="bg-soc-panel border-4 border-soc-border rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 border-b-2 border-soc-border bg-soc-bg flex items-center justify-between">
              <div className="flex items-center space-x-4"><div className="p-3 bg-soc-secondary/10 rounded-xl text-soc-secondary border border-soc-secondary/30"><Plus size={24} /></div><h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">INITIALIZE_LEGAL_DOCKET</h2></div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-soc-muted hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateCase} className="p-10 space-y-8">
              <input type="text" required placeholder="CASE_TITLE..." className="w-full bg-soc-bg border-2 border-soc-border rounded-2xl p-4 text-sm font-bold text-white focus:outline-none italic" value={newCaseData.title} onChange={(e) => setNewCaseData({...newCaseData, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-8">
                <select className="w-full bg-soc-bg border-2 border-soc-border rounded-2xl p-4 text-sm font-bold text-white italic" value={newCaseData.severity} onChange={(e) => setNewCaseData({...newCaseData, severity: e.target.value})}><option value="low">LOW</option><option value="medium">MEDIUM</option><option value="high">HIGH</option><option value="critical">CRITICAL</option></select>
                <input type="text" className="w-full bg-soc-bg border-2 border-soc-border rounded-2xl p-4 text-sm font-bold text-white italic" value={newCaseData.analyst_assigned} onChange={(e) => setNewCaseData({...newCaseData, analyst_assigned: e.target.value})} />
              </div>
              <div className="pt-6 flex space-x-6"><button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-8 py-4 bg-soc-panel border-2 border-soc-border rounded-2xl text-xs font-black uppercase italic">DISCARD</button><button type="submit" disabled={creatingCase || !newCaseData.title.trim()} className="flex-1 px-8 py-4 bg-soc-secondary text-soc-bg rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)] text-xs font-black uppercase italic">{creatingCase ? 'EMITTING...' : 'COMMIT'}</button></div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

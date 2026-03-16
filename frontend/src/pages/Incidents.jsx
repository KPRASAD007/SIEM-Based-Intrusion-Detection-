import React, { useState, useEffect } from 'react';
import { Briefcase, User, MessageSquare, Clock, X, CheckCircle, AlertCircle, Plus, Send } from 'lucide-react';

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

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/incidents')
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
        case_id: "PENDING", // Backend will generate CAS-XXXX
        status: "open",
        alerts_linked: [],
        notes: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const res = await fetch('http://localhost:8000/api/incidents', {
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
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/incidents/${id}/status?status=${newStatus}`, {
        method: 'PUT'
      });
      if (res.ok) {
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc));
        if (selectedCase?.id === id) {
          setSelectedCase({ ...selectedCase, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Failed to update case status", err);
    }
  };

  const submitNote = async () => {
    if (!newNote.trim() || !selectedCase) return;
    setSubmittingNote(true);
    try {
      const res = await fetch(`http://localhost:8000/api/incidents/${selectedCase.id}/notes?note_content=${encodeURIComponent(newNote)}`, {
        method: 'PUT'
      });
      if (res.ok) {
        const addedNote = await res.json();
        const updatedCase = {
          ...selectedCase,
          notes: [...(selectedCase.notes || []), addedNote]
        };
        setSelectedCase(updatedCase);
        setIncidents(prev => prev.map(inc => inc.id === selectedCase.id ? updatedCase : inc));
        setNewNote('');
      }
    } catch (err) {
      console.error("Failed to add note", err);
    }
    setSubmittingNote(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soc-text">Case Management</h2>
          <p className="text-sm text-soc-muted mt-1">Track and investigate escalated security incidents</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-soc-primary text-white rounded hover:bg-blue-600 transition-colors text-sm shadow-lg shadow-soc-primary/20 flex items-center"
        >
          <Plus size={16} className="mr-2" /> New Case
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-soc-muted p-4 col-span-full text-center">Loading cases...</div>
        ) : incidents.length === 0 ? (
          <div className="bg-soc-panel border border-soc-border p-12 rounded-lg text-center text-soc-muted col-span-full shadow-lg">
            <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No active incidents.</p>
            <p className="text-sm mt-1">Escalate alerts to create a new case.</p>
          </div>
        ) : (
          incidents.map(inc => (
            <div key={inc.id} className="bg-soc-panel border border-soc-border rounded-lg shadow-lg hover:shadow-soc-primary/5 transition-all group overflow-hidden">
              <div className="p-5 border-b border-soc-border bg-gradient-to-br from-soc-panel to-soc-bg/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono bg-soc-bg px-2 py-1 rounded text-soc-muted border border-soc-border">
                    {inc.case_id}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    inc.severity === 'critical' ? 'text-soc-critical bg-soc-critical/10' : 
                    inc.severity === 'high' ? 'text-soc-danger bg-soc-danger/10' : 
                    'text-soc-warning bg-soc-warning/10'
                  }`}>
                    {inc.severity.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-soc-text block truncate" title={inc.title}>{inc.title}</h3>
              </div>
              <div className="p-5 bg-soc-bg/30 space-y-4">
                <div className="flex items-center justify-between text-sm text-soc-muted">
                  <span className="flex items-center"><User size={14} className="mr-2 text-soc-primary" /> {inc.analyst_assigned || 'Unassigned'}</span>
                  <span className="flex items-center"><MessageSquare size={14} className="mr-1 text-soc-primary" /> {inc.notes?.length || 0} Notes</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-soc-border/30">
                  <span className={`font-medium px-2 py-0.5 rounded-full text-xs box-shadow-glow ${
                    inc.status === 'open' ? 'bg-soc-primary/20 text-soc-primary' : 
                    inc.status === 'closed' ? 'bg-soc-success/20 text-soc-success' : 
                    'bg-soc-warning/20 text-soc-warning'
                  }`}>
                    {inc.status.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => openCaseDetails(inc)}
                    className="text-soc-primary hover:text-blue-400 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Open Case &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-12">
          <div className="bg-soc-panel border border-soc-border rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-soc-border bg-gradient-to-r from-soc-bg to-soc-panel flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-soc-primary/10 rounded-lg text-soc-primary">
                  <Briefcase size={24} />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-xs font-mono text-soc-muted">{selectedCase.case_id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      selectedCase.severity === 'critical' ? 'bg-soc-critical text-white' : 'bg-soc-danger/20 text-soc-danger'
                    }`}>
                      {selectedCase.severity}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-soc-text">{selectedCase.title}</h2>
                  <p className="text-sm text-soc-muted mt-1 flex items-center">
                    <User size={14} className="mr-1" /> Assigned to: <span className="text-soc-primary ml-1">{selectedCase.analyst_assigned || 'Unassigned'}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedCase(null)} className="p-2 text-soc-muted hover:text-white hover:bg-soc-border rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Alerts and Context */}
              <div className="w-1/3 border-r border-soc-border bg-soc-bg/20 p-6 overflow-y-auto custom-scrollbar">
                <h4 className="text-xs font-semibold text-soc-muted uppercase tracking-widest mb-4">Case Overview</h4>
                <div className="space-y-4">
                  <div className="bg-soc-panel/50 border border-soc-border rounded-lg p-4">
                    <label className="text-xs text-soc-muted block mb-2 font-medium">Manage Status</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button 
                        onClick={() => handleStatusUpdate(selectedCase.id, 'open')}
                        className={`text-xs py-2 rounded border transition-all ${selectedCase.status === 'open' ? 'bg-soc-primary text-white border-soc-primary shadow-lg shadow-soc-primary/20' : 'bg-soc-bg border-soc-border text-soc-muted hover:border-soc-muted'}`}
                       >
                        OPEN
                       </button>
                       <button 
                         onClick={() => handleStatusUpdate(selectedCase.id, 'closed')}
                         className={`text-xs py-2 rounded border transition-all ${selectedCase.status === 'closed' ? 'bg-soc-success text-white border-soc-success shadow-lg shadow-soc-success/20' : 'bg-soc-bg border-soc-border text-soc-muted hover:border-soc-muted'}`}
                       >
                        CLOSED
                       </button>
                    </div>
                  </div>

                  <div className="bg-soc-panel/50 border border-soc-border rounded-lg p-4">
                    <label className="text-xs text-soc-muted block mb-2 font-medium">Evidence Context</label>
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs">
                          <span className="text-soc-muted">Affected Host:</span>
                          <span className="text-soc-text font-mono">LAB-WS-09</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-soc-muted">Linked Alerts:</span>
                          <span className="text-soc-text">4 detected</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Timeline & Notes */}
              <div className="flex-1 flex flex-col bg-soc-panel/30">
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
                  <h4 className="text-xs font-semibold text-soc-muted uppercase tracking-widest mb-4">Investigation Timeline</h4>
                  
                  {(!selectedCase.notes || selectedCase.notes.length === 0) ? (
                    <div className="text-center py-12 text-soc-muted">
                      <Clock size={32} className="mx-auto mb-2 opacity-10" />
                      <p className="text-sm">No notes have been recorded for this case yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedCase.notes.map((note, idx) => (
                        <div key={idx} className="bg-soc-bg/40 border border-soc-border/50 rounded-lg p-4 relative group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-soc-primary flex items-center">
                              <User size={12} className="mr-1" /> {note.author}
                            </span>
                            <span className="text-[10px] text-soc-muted">
                              {new Date(note.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-soc-text leading-relaxed">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Note Input */}
                <div className="p-6 border-t border-soc-border bg-soc-bg/30">
                  <div className="relative">
                    <textarea 
                      placeholder="Add analyst note or investigation update..."
                      className="w-full bg-soc-panel border border-soc-border rounded-lg p-4 pt-3 pb-12 text-sm text-soc-text focus:outline-none focus:border-soc-primary transition-all resize-none min-h-[120px]"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center space-x-3">
                       <span className="text-[10px] text-soc-muted uppercase font-bold tracking-tighter">Enter to send note</span>
                       <button 
                        disabled={submittingNote || !newNote.trim()}
                        onClick={submitNote}
                        className="bg-soc-primary text-white p-2 rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-soc-primary/20 disabled:opacity-50"
                       >
                        <Send size={18} />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* New Case Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-soc-panel border border-soc-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-soc-border bg-gradient-to-r from-soc-bg to-soc-panel flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Plus className="text-soc-primary" size={24} />
                <h2 className="text-xl font-bold text-soc-text">Create New Case</h2>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-soc-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCase} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-soc-muted uppercase mb-2">Incident Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Unauthorized Access on LAB-SRV-01"
                  className="w-full bg-soc-bg border border-soc-border rounded-lg p-3 text-sm text-soc-text focus:outline-none focus:border-soc-primary transition-all"
                  value={newCaseData.title}
                  onChange={(e) => setNewCaseData({...newCaseData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-soc-muted uppercase mb-2">Severity</label>
                  <select 
                    className="w-full bg-soc-bg border border-soc-border rounded-lg p-3 text-sm text-soc-text focus:outline-none focus:border-soc-primary appearance-none cursor-pointer"
                    value={newCaseData.severity}
                    onChange={(e) => setNewCaseData({...newCaseData, severity: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-soc-muted uppercase mb-2">Assign Analyst</label>
                  <input 
                    type="text"
                    className="w-full bg-soc-bg border border-soc-border rounded-lg p-3 text-sm text-soc-text focus:outline-none focus:border-soc-primary"
                    value={newCaseData.analyst_assigned}
                    onChange={(e) => setNewCaseData({...newCaseData, analyst_assigned: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-soc-bg border border-soc-border rounded-lg hover:bg-soc-border transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creatingCase || !newCaseData.title.trim()}
                  className="flex-1 px-4 py-2 bg-soc-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-lg shadow-soc-primary/20 disabled:opacity-50"
                >
                  {creatingCase ? 'Creating...' : 'Launch Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

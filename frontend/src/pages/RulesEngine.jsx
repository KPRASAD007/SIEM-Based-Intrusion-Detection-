import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Info, ChevronDown, ChevronRight, Activity, Target, CheckCircle, XCircle } from 'lucide-react';

export default function RulesEngine() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
  
  const toggleExpand = (id) => {
    if (expandedRule === id) {
      setExpandedRule(null);
    } else {
      setExpandedRule(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soc-text">Detection Rules Engine</h2>
          <p className="text-sm text-soc-muted mt-1">Manage active correlation and detection rules</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-soc-primary text-white rounded hover:bg-blue-600 flex items-center shadow-lg shadow-soc-primary/20">
          <Plus size={16} className="mr-2" /> New Rule
        </button>
      </div>

      <div className="bg-soc-panel border border-soc-border rounded-lg shadow-lg overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-soc-bg text-soc-muted border-b border-soc-border">
            <tr>
              <th className="px-4 py-4 w-10"></th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Rule Name</th>
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4 font-medium">MITRE ID</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border">
            {loading ? (
               <tr><td colSpan="6" className="px-6 py-8 text-center text-soc-muted">Loading rules...</td></tr>
            ) : rules.length === 0 ? (
               <tr><td colSpan="6" className="px-6 py-8 text-center text-soc-muted">No rules defined. Create one to start detecting threats.</td></tr>
            ) : rules.map(rule => (
              <React.Fragment key={rule.id}>
                <tr 
                  onClick={() => toggleExpand(rule.id)}
                  className={`hover:bg-soc-bg/40 cursor-pointer transition-colors ${!rule.is_active ? 'opacity-60' : ''} ${expandedRule === rule.id ? 'bg-soc-bg/20' : ''}`}
                >
                  <td className="px-4 py-4 text-soc-muted">
                    {expandedRule === rule.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={(e) => toggleRule(rule.id, e)} 
                      className={`flex items-center px-3 py-1 rounded-full text-xs font-bold transition-colors ${rule.is_active ? 'bg-soc-success/20 text-soc-success border border-soc-success/30' : 'bg-soc-border text-soc-muted border border-soc-border/50'}`}
                    >
                      {rule.is_active ? (
                        <><CheckCircle size={14} className="mr-1.5" /> ACTIVE</>
                      ) : (
                        <><XCircle size={14} className="mr-1.5" /> DISABLED</>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-soc-text">{rule.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold bg-soc-bg border
                      ${rule.severity === 'critical' ? 'text-soc-critical border-soc-critical/50' : 
                        rule.severity === 'high' ? 'text-soc-danger border-soc-danger/50' : 
                        'text-soc-warning border-soc-warning/50'}`}>
                      {rule.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-soc-primary font-mono">{rule.mitre_attack_id}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={(e) => deleteRule(rule.id, e)} className="p-2 text-soc-muted hover:text-soc-danger transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
                {expandedRule === rule.id && (
                  <tr className="bg-soc-bg/50 border-b border-soc-border/50">
                    <td colSpan="6" className="px-10 py-6 whitespace-normal">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-soc-muted text-xs font-bold uppercase tracking-wider mb-2 flex items-center">
                            <Info size={14} className="mr-1.5" /> Rule Description
                          </h4>
                          <p className="text-soc-text text-sm mb-4 leading-relaxed bg-soc-panel p-3 rounded border border-soc-border/50">
                            {rule.description}
                          </p>
                          <h4 className="text-soc-muted text-xs font-bold uppercase tracking-wider mb-2 flex items-center">
                            <Target size={14} className="mr-1.5" /> Threat Mapping
                          </h4>
                          <p className="text-sm text-soc-text flex items-center bg-soc-panel p-3 rounded border border-soc-border/50">
                            This rule maps to MITRE ATT&CK technique <strong className="mx-1 text-soc-primary">{rule.mitre_attack_id}</strong>.
                            When this technique is observed, it indicates potential adversarial logic execution.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-soc-muted text-xs font-bold uppercase tracking-wider mb-2 flex items-center">
                            <Activity size={14} className="mr-1.5" /> Detection Logic (Engine Matcher)
                          </h4>
                          <div className="bg-[#0D1117] p-4 rounded border border-soc-border/50 font-mono text-sm text-gray-300">
                            <span className="text-purple-400">if</span> (log.<span className="text-blue-400">{rule.field}</span> <span className="text-red-400">{rule.operator}</span> <span className="text-green-400">"{rule.value}"</span>) {'{'}
                            <br />&nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-orange-400">Alert</span>(severity=<span className="text-green-400">"{rule.severity}"</span>)
                            <br />{'}'}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-soc-panel border border-soc-border rounded-lg p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Create Detection Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-sm text-soc-muted mb-1">Rule Name</label>
                <input required type="text" className="w-full bg-soc-bg border border-soc-border rounded p-2 text-soc-text" 
                  value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} />
              </div>
               <div>
                <label className="block text-sm text-soc-muted mb-1">Description</label>
                <input required type="text" className="w-full bg-soc-bg border border-soc-border rounded p-2 text-soc-text" 
                 value={newRule.description} onChange={e => setNewRule({...newRule, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-soc-muted mb-1">Field</label>
                  <select className="w-full bg-soc-bg border border-soc-border rounded p-2 text-soc-text"
                    value={newRule.field} onChange={e => setNewRule({...newRule, field: e.target.value})}>
                    <option value="process_name">process_name</option>
                    <option value="event_id">event_id</option>
                    <option value="ip_address">ip_address</option>
                    <option value="command_line">command_line</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-soc-muted mb-1">Operator</label>
                  <select className="w-full bg-soc-bg border border-soc-border rounded p-2 text-soc-text"
                    value={newRule.operator} onChange={e => setNewRule({...newRule, operator: e.target.value})}>
                    <option value="equals">equals</option>
                    <option value="contains">contains</option>
                    <option value="regex">regex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-soc-muted mb-1">Value</label>
                  <input required type="text" className="w-full bg-soc-bg border border-soc-border rounded p-2 text-soc-text" 
                    value={newRule.value} onChange={e => setNewRule({...newRule, value: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-soc-muted mb-1">Severity</label>
                  <select className="w-full bg-soc-bg border border-soc-border rounded p-2 text-soc-text"
                    value={newRule.severity} onChange={e => setNewRule({...newRule, severity: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-soc-muted mb-1">MITRE ATT&CK ID</label>
                  <input required type="text" placeholder="e.g. T1059" className="w-full bg-soc-bg border border-soc-border rounded p-2 text-soc-text" 
                    value={newRule.mitre_attack_id} onChange={e => setNewRule({...newRule, mitre_attack_id: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-soc-bg border border-soc-border rounded hover:bg-soc-border transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-soc-primary text-white rounded hover:bg-blue-600 transition-colors">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

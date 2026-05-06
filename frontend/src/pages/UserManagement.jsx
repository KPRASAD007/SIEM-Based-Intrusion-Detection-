import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Shield, Mail, Calendar, Activity, Lock, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';


export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', alert_email: '' });
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem('siem_token');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError("Failed to fetch users. Admin clearance required.");
      }
    } catch (err) {
      setError("Network error connecting to auth service.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setModalError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setSuccess(`Operator ${newUser.username} commissioned successfully.`);
        setShowAddModal(false);
        setNewUser({ username: '', password: '', alert_email: '' });
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setModalError(data.detail || "Commissioning failed. Ensure all fields are valid.");
      }
    } catch (err) {
      setModalError("CRITICAL_FAILURE: Gateway timeout or connection lost.");
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Decommission Operator ${username}? This action is irreversible.`)) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${username}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess(`Operator ${username} decommissioned.`);
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.detail || "Decommissioning failed.");
      }
    } catch (err) {
      setError("Failed to reach auth gateway.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-2 border-soc-primary/20 pb-8 relative z-10">
        <div className="absolute -bottom-[2px] left-0 w-32 h-[2px] bg-soc-primary shadow-[0_0_15px_rgba(0,243,255,0.8)]"></div>
        <div>
           <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-soc-primary to-soc-bg tracking-[0.2em] uppercase italic flex items-center">
             <Users className="mr-4 text-soc-primary drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]" size={36} /> OPERATOR_MANAGEMENT
           </h2>
           <p className="text-[10px] font-bold text-soc-secondary tracking-[0.4em] mt-3 flex items-center italic">
             <span className="w-2 h-2 bg-soc-primary rounded-full inline-block mr-2 animate-pulse"></span> SOC IDENTITY AND ACCESS CONTROL
           </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-8 py-4 bg-soc-primary/10 border-2 border-soc-primary/30 rounded-2xl hover:bg-soc-primary hover:text-soc-bg transition-all text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,243,255,0.2)] group"
        >
          <UserPlus size={16} className="mr-3 group-hover:scale-110 transition-transform" /> Commission_New_Operator
        </button>
      </div>

      {/* Alerts Area */}
      {error && (
        <div className="bg-soc-critical/10 border-l-4 border-soc-critical p-6 rounded-xl flex items-center space-x-4 animate-in slide-in-from-left-4">
           <AlertTriangle className="text-soc-critical shrink-0" size={24} />
           <p className="text-xs font-black text-soc-critical uppercase tracking-widest italic">{error}</p>
           <button onClick={() => setError(null)} className="ml-auto text-soc-muted hover:text-white"><X size={16} /></button>
        </div>
      )}
      {success && (
        <div className="bg-soc-primary/10 border-l-4 border-soc-primary p-6 rounded-xl flex items-center space-x-4 animate-in slide-in-from-left-4">
           <CheckCircle className="text-soc-primary shrink-0" size={24} />
           <p className="text-xs font-black text-soc-primary uppercase tracking-widest italic">{success}</p>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-soc-border rounded-3xl">
             <div className="w-12 h-12 border-4 border-soc-primary/20 border-t-soc-primary rounded-full animate-spin mb-4"></div>
             <p className="text-[10px] font-black text-soc-muted uppercase tracking-[0.4em]">Decrypting_Identity_Vault...</p>
          </div>
        ) : (
          users.map(user => (
            <div key={user.username} className="bg-soc-panel/30 backdrop-blur-3xl border border-soc-border p-6 rounded-3xl relative overflow-hidden group hover:border-soc-primary/50 transition-all shadow-2xl">
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                  <Shield size={80} className="text-soc-primary" />
               </div>
               
               <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                     <div className="w-14 h-14 rounded-2xl border border-soc-primary/30 p-1.5 bg-soc-bg">
                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} alt="User" className="w-full h-full object-cover rounded-xl" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-white italic tracking-tight">{user.username}</h3>
                        <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-2 py-0.5 rounded border ${user.role === 'admin' ? 'bg-soc-primary/10 border-soc-primary text-soc-primary' : 'bg-soc-secondary/10 border-soc-secondary text-soc-secondary'}`}>
                           {user.role}
                        </span>
                     </div>
                  </div>
                  {user.username !== localStorage.getItem('siem_user') && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.username);
                      }}
                      className="p-3 text-soc-muted hover:text-soc-critical hover:bg-soc-critical/20 rounded-xl transition-all border border-transparent hover:border-soc-critical/50 relative z-[50] cursor-pointer group/del"
                      title="Decommission Operator"
                    >
                      <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                    </button>
                  )}
               </div>

               <div className="space-y-3">
                  <div className="flex items-center text-[10px] font-bold text-soc-muted uppercase tracking-widest">
                     <Mail size={14} className="mr-3 text-soc-primary" /> {user.alert_email || 'NO_COMMS_LINK'}
                  </div>
                  <div className="flex items-center text-[10px] font-bold text-soc-muted uppercase tracking-widest">
                     <Calendar size={14} className="mr-3 text-soc-secondary" /> Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'UNKNOWN'}
                  </div>
               </div>

               <div className="mt-6 pt-6 border-t border-soc-border/50 flex justify-between items-center">
                  <div className="flex items-center text-[9px] font-black text-soc-primary uppercase tracking-widest">
                     <Activity size={12} className="mr-2" /> Clearance_Active
                  </div>
                  <div className="w-2 h-2 bg-soc-primary rounded-full animate-ping"></div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[300] bg-soc-bg/95 backdrop-blur-3xl flex items-center justify-center p-4">
           <div className="bg-soc-panel border-2 border-soc-primary/30 rounded-[3rem] shadow-[0_0_100px_rgba(0,243,255,0.2)] w-full max-w-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-soc-primary to-transparent"></div>
              
              <div className="p-12">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">New_Operator_Commission</h3>
                       <p className="text-[10px] text-soc-primary font-black uppercase tracking-[0.4em] mt-2 italic">ESTABLISHING VANGUARD CLEARANCE</p>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="p-3 bg-soc-bg border border-soc-border rounded-2xl hover:border-soc-primary transition-all text-soc-muted">
                       <X size={24} />
                    </button>
                 </div>

                 {modalError && (
                    <div className="mb-6 bg-soc-critical/10 border-l-4 border-soc-critical p-4 rounded-xl flex items-center space-x-3 animate-in fade-in zoom-in duration-300">
                       <AlertTriangle className="text-soc-critical shrink-0" size={20} />
                       <p className="text-[10px] font-black text-soc-critical uppercase tracking-widest italic">{modalError}</p>
                    </div>
                 )}

                 <form onSubmit={handleAddUser} className="space-y-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-soc-muted uppercase tracking-widest">Operator Identity (Username)</label>
                       <input 
                         required
                         className="w-full bg-soc-bg border-b-2 border-soc-border p-4 text-white font-black outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/20 italic"
                         placeholder="ID_SEQUENCE"
                         value={newUser.username}
                         onChange={e => setNewUser({...newUser, username: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-soc-muted uppercase tracking-widest">Neural Password (Password)</label>
                       <input 
                         required
                         type="password"
                         className="w-full bg-soc-bg border-b-2 border-soc-border p-4 text-white font-black outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/20 italic tracking-widest"
                         placeholder="••••••••"
                         value={newUser.password}
                         onChange={e => setNewUser({...newUser, password: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-soc-muted uppercase tracking-widest">Comms Link (Email)</label>
                       <input 
                         required
                         type="email"
                         className="w-full bg-soc-bg border-b-2 border-soc-border p-4 text-white font-black outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/20 italic"
                         placeholder="ANALYST@SOC.NEXUS"
                         value={newUser.alert_email}
                         onChange={e => setNewUser({...newUser, alert_email: e.target.value})}
                       />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-5 bg-soc-primary text-soc-bg font-black uppercase tracking-[0.4em] rounded-2xl shadow-[0_0_40px_rgba(0,243,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center italic"
                    >
                       <Lock size={18} className="mr-3" /> Commit_Identity_Sequence
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

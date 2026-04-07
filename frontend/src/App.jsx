import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LogManagement from './pages/LogManagement';
import AlertsCenter from './pages/AlertsCenter';
import Incidents from './pages/Incidents';
import RulesEngine from './pages/RulesEngine';
import Simulator from './pages/Simulator';
import MitreMapping from './pages/MitreMapping';
import Documentation from './pages/Documentation';
import Login from './pages/Login';
import RemoteSensors from './pages/RemoteSensors';
import WebSurveillance from './pages/WebSurveillance';
import DeceptionOps from './pages/DeceptionOps';
import BehavioralAnalytics from './pages/BehavioralAnalytics';
import Forensics from './pages/Forensics';
import { Shield, LayoutDashboard, Database, Activity, Briefcase, Settings, FileText, Target, Bell, X, Globe, Eye, Fingerprint, Ghost, Zap, Search, HardDrive, Terminal } from 'lucide-react';

function SidebarItem({ to, icon: Icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className={`flex items-center px-4 py-4 rounded-3xl transition-all duration-500 mb-2 relative overflow-hidden group/item ${isActive ? 'bg-soc-primary/20 shadow-[inset_0_0_20px_rgba(0,243,255,0.4)] border border-soc-primary/30' : 'hover:bg-soc-primary/5 border border-transparent hover:border-soc-primary/10'}`}>
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full bg-soc-primary transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full group-hover/item:opacity-50 group-hover/item:translate-x-0'}`}></div>
      <Icon size={24} className={`min-w-[24px] ml-1 transition-all duration-500 ${isActive ? 'text-soc-primary drop-shadow-[0_0_8px_rgba(0,243,255,0.8)] scale-110' : 'text-soc-muted group-hover/item:text-white group-hover/item:scale-110'}`} />
      <span className="font-bold relative z-10 tracking-[0.2em] ml-6 opacity-0 translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-500 whitespace-nowrap text-xs uppercase">{label}</span>
    </Link>
  );
}

function App() {
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Fetch admin profile data when authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetch(`http://${window.location.hostname}:8080/api/auth/profile/${currentUser}`)
        .then(res => res.json())
        .then(data => {
          if (data.alert_email) setAlertEmail(data.alert_email);
        })
        .catch(err => console.error("Error fetching profile", err));
    }
  }, [isAuthenticated, currentUser]);

  const saveProfile = async () => {
    setSavingEmail(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, alert_email: alertEmail })
      });
      if (res.ok) {
        setEmailStatus('Saved successfully!');
        setTimeout(() => setEmailStatus(''), 2000);
      } else {
        setEmailStatus('Failed to save.');
      }
    } catch(err) {
      setEmailStatus('Error connecting to server.');
    }
    setSavingEmail(false);
  };

  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connectWebSocket = () => {
      ws = new WebSocket(`ws://${window.location.hostname}:8080/api/logs/ws`);
      
      ws.onopen = () => {
        console.log("Connected to SOC real-time stream");
        clearTimeout(reconnectTimer);
      };
      
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_ALERT') {
             const newAlert = payload.data;
             setLiveAlerts(prev => [newAlert, ...prev].slice(0, 3));
             
             setTimeout(() => {
               setLiveAlerts(current => current.filter(a => (a._id || a.id) !== (newAlert._id || newAlert.id)));
             }, 5500);
          }
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      };

      ws.onclose = () => {
        console.log("SOC stream disconnected. Reconnecting in 3s...");
        reconnectTimer = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  const dismissAlert = (id) => {
    setLiveAlerts(prev => prev.filter(a => a._id !== id));
  };

  if (!isAuthenticated) {
    return <Login onLogin={(username) => { setIsAuthenticated(true); setCurrentUser(username); }} />;
  }

  const logoUrl = `http://${window.location.hostname}:8080/api/download/logo.png`;

  return (
    <Router>
      <div className="flex h-screen bg-soc-bg text-soc-text font-orbitron overflow-hidden scanline relative selection:bg-soc-primary selection:text-soc-bg">
        {/* Global Deep Space / Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-soc-secondary/5 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-soc-primary/5 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen animate-pulse"></div>

        {/* Floating Expandable HUD Side-Dock */}
        <div className="fixed left-6 top-6 bottom-6 w-24 hover:w-80 bg-soc-panel/40 backdrop-blur-3xl border border-soc-primary/20 rounded-[3rem] shadow-[0_0_50px_rgba(0,243,255,0.1),inset_0_0_20px_rgba(0,243,255,0.05)] z-[100] transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col group/sidebar overflow-hidden">
          
          <div className="p-8 flex items-center justify-center group-hover/sidebar:justify-start relative">
             <div className="w-10 h-10 border-2 border-soc-primary shadow-[0_0_15px_rgba(0,243,255,0.6)] rounded-xl flex items-center justify-center shrink-0 bg-soc-bg">
                <Shield size={20} className="text-soc-primary" />
             </div>
             <div className="absolute left-24 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                <h1 className="text-xl font-black text-white tracking-[0.3em] uppercase">CYBER<span className="text-soc-primary">DETECT</span></h1>
             </div>
          </div>

          <nav className="flex-1 px-4 pb-4 overflow-y-auto custom-scrollbar">
            <SidebarItem to="/" icon={Zap} label="Briefing" />
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Command" />
            <SidebarItem to="/logs" icon={Database} label="Telemetry" />
            <SidebarItem to="/alerts" icon={Activity} label="Threats" />
            
            <div className="my-4 mx-4 h-px bg-gradient-to-r from-transparent via-soc-primary/30 to-transparent"></div>
            
            <SidebarItem to="/sensors" icon={Globe} label="Agents" />
            <SidebarItem to="/deception" icon={Ghost} label="Deception" />
            <SidebarItem to="/behavior" icon={Fingerprint} label="Behavioral" />
            <SidebarItem to="/forensics" icon={Search} label="Sandbox" />
            <SidebarItem to="/incidents" icon={Briefcase} label="Cases" />
            
            <div className="my-4 mx-4 h-px bg-gradient-to-r from-transparent via-soc-primary/30 to-transparent"></div>
            
            <SidebarItem to="/rules" icon={Settings} label="Rules" />
            <SidebarItem to="/simulator" icon={Target} label="Simulate" />
          </nav>
        </div>
        
        {/* Main Content Area (Pushed over to avoid floating dock) */}
        <div className="flex-1 flex flex-col relative w-full h-full pl-36 pt-6 pr-6 pb-6 min-w-0 z-10 transition-all duration-500">
          
          {/* Floating Top Nav Pill */}
          <header className="absolute top-6 right-6 h-16 bg-soc-panel/30 backdrop-blur-2xl border border-soc-primary/30 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-end px-6 z-[110]">
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex flex-col items-end">
                  <div className="flex items-center space-x-2">
                     <span className="text-[9px] font-black text-soc-secondary uppercase animate-ping absolute">LIVE</span>
                     <span className="text-[9px] font-black text-soc-primary uppercase relative">LIVE STRM</span>
                  </div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-soc-primary shadow-[0_0_10px_rgba(0,243,255,0.4)] overflow-hidden cursor-pointer hover:border-white transition-all bg-soc-bg flex items-center justify-center p-1" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser || 'admin'}`} alt="User" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-transparent custom-scrollbar relative rounded-[3rem] border border-soc-primary/10 shadow-[inner_0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-sm p-8">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/logs" element={<LogManagement />} />
              <Route path="/alerts" element={<AlertsCenter />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/sensors" element={<RemoteSensors />} />
              <Route path="/deception" element={<DeceptionOps />} />
              <Route path="/behavior" element={<BehavioralAnalytics />} />
              <Route path="/forensics" element={<Forensics />} />
              <Route path="/web" element={<WebSurveillance />} />
              <Route path="/rules" element={<RulesEngine />} />
              <Route path="/mitre" element={<MitreMapping />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/docs" element={<Documentation />} />
            </Routes>
          </main>
          
          {showProfileMenu && (
             <div className="absolute top-14 right-8 w-72 bg-soc-panel border border-soc-border rounded-b-lg shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                <div className="p-5 border-b border-soc-border bg-soc-bg/40">
                   <p className="text-xs font-bold text-soc-primary uppercase mb-1">Authenticated Analyst</p>
                   <p className="text-lg font-bold text-white tracking-tight">{currentUser || 'SYSTEM_ROOT'}</p>
                </div>
                <div className="p-5 space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-soc-muted uppercase tracking-wider">Alert Routing Endpoint</label>
                      <input 
                        type="email" 
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                        className="w-full bg-soc-bg border border-soc-border rounded p-2 text-xs text-soc-text focus:border-soc-primary outline-none transition-all"
                      />
                   </div>
                   <button 
                     onClick={saveProfile}
                     disabled={savingEmail}
                     className="w-full bg-soc-primary/10 hover:bg-soc-primary text-soc-primary hover:text-white border border-soc-primary/30 py-2 rounded text-[10px] font-bold uppercase transition-all"
                   >
                     {savingEmail ? 'COMMITTING...' : 'SYNC PREFERENCES'}
                   </button>
                   {emailStatus && <p className="text-[10px] text-center text-soc-primary">{emailStatus}</p>}
                </div>
             </div>
          )}

          {/* Live Alerts Stream (Toasts) */}
           <div className="fixed bottom-10 right-10 z-[120] flex flex-col space-y-4">
             {liveAlerts.map(alert => (
               <div key={alert._id || alert.id} className="bg-[#050510]/95 backdrop-blur-xl border border-soc-critical/50 p-6 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.3)] w-96 flex items-start justify-between group animate-toast overflow-hidden relative group font-orbitron">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-soc-critical opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                 <div className="absolute top-0 left-0 w-1 h-full bg-soc-critical"></div>
                 
                 <div className="flex items-start z-10 w-full">
                   <div className="p-3 bg-soc-critical/10 rounded-2xl border border-soc-critical/50 mr-5 shrink-0 mt-1">
                      <Bell size={24} className="text-soc-critical animate-bounce" />
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-center mb-1">
                        <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-soc-critical">THREAT_DETECTED</h4>
                        <button onClick={() => dismissAlert(alert._id || alert.id)} className="text-soc-muted hover:text-white transition-colors">
                          <X size={16} />
                        </button>
                     </div>
                     <p className="text-sm font-black text-white mb-3 italic uppercase">{alert.rule_name}</p>
                     
                     <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-soc-border/50">
                        <div className="flex items-center text-[9px] font-mono text-soc-muted">
                           <span className="text-white bg-soc-bg border border-soc-border px-1.5 py-0.5 rounded mr-2 break-all">{alert.affected_host || 'UNK'}</span>
                        </div>
                        <div className="flex items-center text-[9px] font-mono text-soc-secondary justify-end">
                           <Shield size={10} className="mr-1" /> MITRE_{alert.mitre_attack_id || 'XXX'}
                        </div>
                     </div>
                   </div>
                 </div>
                 <button onClick={() => dismissAlert(alert._id || alert.id)} className="text-soc-muted hover:text-white transition-colors">
                   <X size={16} />
                 </button>
               </div>
             ))}
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

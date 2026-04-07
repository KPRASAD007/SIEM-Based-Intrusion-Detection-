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
    <Link to={to} className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 mb-1 ${isActive ? 'bg-soc-primary/10 text-soc-primary box-shadow-glow' : 'text-soc-muted hover:bg-soc-border hover:text-soc-text'}`}>
      <Icon size={20} className="mr-3" />
      <span className="font-medium">{label}</span>
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
      <div className="flex h-screen bg-soc-bg text-soc-text font-sans overflow-hidden scanline">
        <div className={`fixed lg:relative left-0 top-0 h-full bg-soc-panel border-r border-soc-border flex flex-col shadow-2xl z-[100] transition-all duration-300 ease-in-out ${isSidebarVisible ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}`}>
          <div className="p-6 flex items-center space-x-3 mb-4">
             <img src={logoUrl} alt="Logo" className="w-10 h-10 border-2 border-soc-primary rounded-lg shadow-lg" />
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-soc-primary to-accent uppercase tracking-tighter">
                Detect Lab
             </h1>
          </div>
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarItem to="/" icon={Zap} label="SOC Briefing" />
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Command Center" />
            <SidebarItem to="/logs" icon={Database} label="Log Analyzer" />
            <SidebarItem to="/alerts" icon={Activity} label="Threat Alerts" />
            <SidebarItem to="/incidents" icon={Briefcase} label="Case Manager" />
            <div className="block h-px bg-soc-border my-4 mx-2 opacity-50" />
            
            <SidebarItem to="/sensors" icon={Globe} label="Remote Agents" />
            
            <div className="pt-4">
              <p className="px-4 text-[10px] font-bold text-soc-secondary uppercase tracking-[0.2em] mb-2 opacity-50 italic underline decoration-soc-secondary">Advanced Intelligence</p>
              <SidebarItem to="/deception" icon={Ghost} label="Deception Ops" />
              <SidebarItem to="/behavior" icon={Fingerprint} label="Behavioral Sync" />
              <SidebarItem to="/forensics" icon={Search} label="Artifact Sandbox" />
              <SidebarItem to="/web" icon={Eye} label="Web Intercept" />
            </div>

            <div className="pt-4">
              <p className="px-4 text-[10px] font-bold text-soc-muted uppercase tracking-[0.2em] mb-2 opacity-50">Operations</p>
              <SidebarItem to="/rules" icon={Settings} label="Detection Rules" />
              <SidebarItem to="/mitre" icon={Target} label="ATT&CK Matrix" />
              <SidebarItem to="/simulator" icon={Shield} label="SIMULATION" />
              <SidebarItem to="/docs" icon={FileText} label="Lab Docs" />
            </div>
          </nav>
          <div className="p-4 border-t border-soc-border bg-soc-bg/50 flex flex-col items-center">
             <div className="flex items-center space-x-2 text-[10px] font-mono text-soc-primary animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-soc-primary"></div>
                <span>CORE_SYSTEM_READY</span>
             </div>
             <p className="text-[10px] text-soc-muted mt-1 uppercase opacity-30">Build v2.1.0-STABLE</p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col relative w-full min-w-0">
          <header className="h-14 bg-soc-bg/50 backdrop-blur-xl border-b border-soc-border flex items-center justify-between px-8 z-[110]">
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                className="mr-6 p-2 text-soc-muted hover:bg-soc-border hover:text-soc-primary rounded transition-all"
              >
                <LayoutDashboard size={18} />
              </button>
              <div className="flex items-center space-x-2 text-[11px] font-bold text-soc-muted uppercase tracking-widest">
                 <Shield size={14} className="text-soc-primary" />
                 <span>Security Operations & Research Intelligence Environment</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex flex-col items-end">
                  <div className="flex items-center space-x-2">
                     <span className="text-[10px] font-bold text-soc-primary uppercase animate-pulse">Live</span>
                     <span className="text-[10px] font-bold text-soc-text">SYSLOG_MONITOR</span>
                  </div>
                  <div className="text-[9px] text-soc-muted font-mono">{new Date().toISOString()}</div>
              </div>
              <div className="w-8 h-8 rounded border border-soc-primary/50 overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-lg" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser || 'admin'}`} alt="User" />
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-gradient-to-tr from-soc-bg to-[#0b0e14] p-6 lg:p-10 custom-scrollbar relative">
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
               <div key={alert._id || alert.id} className="bg-soc-panel border-l-4 border-soc-critical text-soc-text p-5 rounded shadow-[0_0_30px_rgba(239,68,68,0.15)] w-80 flex items-start justify-between group animate-toast overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-soc-critical/5 rounded-full -mr-8 -mt-8"></div>
                 <div className="flex items-start z-10">
                   <div className="p-2 bg-soc-critical/20 rounded-lg mr-4 mt-1 border border-soc-critical/30">
                      <Bell size={18} className="text-soc-critical" />
                   </div>
                   <div>
                     <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-soc-critical mb-1">Security Alert</h4>
                     <p className="text-xs font-bold text-white mb-2 leading-tight">{alert.rule_name}</p>
                     <div className="flex items-center space-x-2">
                         <span className="text-[10px] font-mono text-soc-muted">HOST:</span>
                         <span className="text-[10px] font-mono text-white bg-soc-bg px-1.5 py-0.5 rounded">{alert.affected_host || 'WS-99'}</span>
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

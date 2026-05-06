import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL, WS_BASE_URL } from './config';

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
import Welcome from './pages/Welcome';
import UserManagement from './pages/UserManagement';
import AuditVault from './pages/AuditVault';
import RemoteSensors from './pages/RemoteSensors';
import WebSurveillance from './pages/WebSurveillance';
import DeceptionOps from './pages/DeceptionOps';
import BehavioralAnalytics from './pages/BehavioralAnalytics';
import Forensics from './pages/Forensics';
import OracleBot from './components/OracleBot';
import { Shield, LayoutDashboard, Database, Activity, Briefcase, Settings, FileText, Target, Bell, X, Globe, Eye, Fingerprint, Ghost, Zap, Search, HardDrive, Terminal, LogOut, Users } from 'lucide-react';





function SidebarItem({ to, icon: Icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 mb-1 group/item ${isActive ? 'bg-soc-primary text-black font-black' : 'text-soc-muted hover:bg-soc-panel hover:text-white'}`}>
      <Icon size={20} className={`shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover/item:scale-110'}`} />
      <span className="ml-4 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">{label}</span>
    </Link>
  );
}

function App() {
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('siem_user') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('siem_role') || null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('siem_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('siem_token'));
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [commandValue, setCommandValue] = useState('');
  const [commandFeedback, setCommandFeedback] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandBarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetch(`${API_BASE_URL}/api/auth/profile/${currentUser}`)

        .then(res => res.json())
        .then(data => {
          if (data.alert_email) setAlertEmail(data.alert_email);
          if (data.role) {
            setUserRole(data.role);
            localStorage.setItem('siem_role', data.role);
          }
        })
        .catch(err => console.error("Error fetching profile", err));
    }
  }, [isAuthenticated, currentUser]);

  const saveProfile = async () => {
    setSavingEmail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {

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
      ws = new WebSocket(`${WS_BASE_URL}/api/logs/ws`);

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
        console.log("SOC stream disconnected. Polling mode active.");
        reconnectTimer = setTimeout(connectWebSocket, 5000); // Slower reconnect on fail
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    // --- POLLING FALLBACK FOR VERCEL ---
    // Since Vercel doesn't support WebSockets, we poll every 10s for new alerts
    const pollAlerts = async () => {
      // Only poll if WebSocket is not OPEN
      if (ws && ws.readyState === WebSocket.OPEN) return;
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/alerts?limit=1`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const latest = data[0];
            // Check if this alert is new (within last 30s)
            const alertTime = new Date(latest.triggered_time).getTime();
            if (Date.now() - alertTime < 30000) {
              setLiveAlerts(prev => {
                const exists = prev.some(a => (a._id || a.id) === (latest._id || latest.id));
                if (exists) return prev;
                
                const next = [latest, ...prev].slice(0, 3);
                setTimeout(() => {
                  setLiveAlerts(current => current.filter(a => (a._id || a.id) !== (latest._id || latest.id)));
                }, 5500);
                return next;
              });
            }
          }
        }
      } catch (err) {
        console.warn("Polling fallback error:", err);
      }
    };

    connectWebSocket();
    const pollInterval = setInterval(pollAlerts, 10000);
    return () => {
        clearInterval(pollInterval);
        if (ws) ws.close();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('siem_token');
    localStorage.removeItem('siem_user');
    localStorage.removeItem('siem_role');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserRole(null);
    setAuthToken(null);
    setShowProfileMenu(false);
  };


  const handleCommand = async (cmd) => {
    const command = cmd.trim().toLowerCase();
    
    if (command === '/clear') {
      setLiveAlerts([]);
      showFeedback('SUCCESS: ALL PERIMETER ALERTS PURGED', 'primary');
    } else if (command === '/system_overview') {
      showFeedback(`SYS_READY // CPU: ${Math.floor(Math.random()*15+5)}% // MEM: 2.1GB // SENSORS: 12 ONLINE`, 'secondary');
    } else if (command === '/summarize') {
       showFeedback('VANGUARD: NO CRITICAL ESCALATIONS IN LAST 30M. PROACTIVE MONITORING ACTIVE.', 'primary');
    } else {
      showFeedback('ERR: INVALID COMMAND SEQUENCE', 'critical');
    }
    
    setCommandValue('');
    setIsCommandBarOpen(false);
  };

  const showFeedback = (text, type) => {
    setCommandFeedback({ text, type });
    setTimeout(() => setCommandFeedback(null), 4000);
  };

  const dismissAlert = (id) => {
    setLiveAlerts(prev => prev.filter(a => a._id !== id));
  };

  if (!isAuthenticated && !showWelcome) {
    return <Login onLogin={(username, token, role) => { 
      setCurrentUser(username); 
      setUserRole(role);
      setAuthToken(token);
      localStorage.setItem('siem_token', token);
      localStorage.setItem('siem_user', username);
      localStorage.setItem('siem_role', role);
      setShowWelcome(true); 
    }} />;
  }

  if (showWelcome) {
    return <Welcome username={currentUser || 'SYSTEM'} onComplete={() => { setShowWelcome(false); setIsAuthenticated(true); }} />;
  }

  const logoUrl = `${API_BASE_URL}/api/download/logo.png`;


  return (
    <Router>
      <div className="flex h-screen bg-soc-bg text-soc-text selection:bg-soc-primary selection:text-black">
        
        {/* Sidebar */}
        <div className="w-20 hover:w-64 bg-soc-panel border-r border-soc-border transition-all duration-500 ease-in-out z-50 flex flex-col group/sidebar">
          <div className="h-20 flex items-center px-6 overflow-hidden">
            <Shield size={32} className="text-soc-primary shrink-0" />
            <span className="ml-4 font-black text-lg tracking-tighter uppercase italic whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity">
              CYBER<span className="text-soc-primary">DETECT</span>
            </span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarItem to="/" icon={Zap} label="Overview" />
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem to="/logs" icon={Database} label="Telemetry" />
            <SidebarItem to="/alerts" icon={Activity} label="Alerts" />
            
            <div className="my-4 h-px bg-soc-border mx-4"></div>
            
            <SidebarItem to="/sensors" icon={Globe} label="Endpoints" />
            <SidebarItem to="/deception" icon={Ghost} label="Deception" />
            <SidebarItem to="/behavior" icon={Fingerprint} label="Behavioral" />
            <SidebarItem to="/incidents" icon={Briefcase} label="Cases" />
            
            <div className="my-4 h-px bg-soc-border mx-4"></div>
            
            <SidebarItem to="/rules" icon={Settings} label="Rules" />
            {userRole === 'admin' && <SidebarItem to="/users" icon={Users} label="Team" />}
            {userRole === 'admin' && <SidebarItem to="/audit" icon={FileText} label="Audit" />}
            <SidebarItem to="/simulator" icon={Target} label="Simulate" />
          </nav>

          <div className="p-4 border-t border-soc-border">
             <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-soc-muted hover:text-soc-critical hover:bg-soc-critical/10 rounded-2xl transition-all group/logout">
                <LogOut size={20} className="shrink-0" />
                <span className="ml-4 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover/sidebar:opacity-100 transition-opacity">Sign Out</span>
             </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-soc-bg relative overflow-hidden">
          {/* Top Bar */}
          <header className="h-20 border-b border-soc-border flex items-center justify-between px-10 bg-soc-bg/80 backdrop-blur-md z-40">
             <div className="flex items-center text-[10px] font-bold text-soc-muted uppercase tracking-[0.4em]">
                <div className="w-2 h-2 rounded-full bg-soc-hacker mr-3 animate-pulse"></div>
                Grid Status: Connected
             </div>
             
             <div className="flex items-center space-x-6">
                <div className="text-right hidden sm:block">
                   <p className="text-[10px] font-black text-white leading-none uppercase">{currentUser}</p>
                   <p className="text-[9px] text-soc-muted uppercase font-bold mt-1">{userRole}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-soc-panel border border-soc-border flex items-center justify-center p-1 cursor-pointer hover:border-soc-primary transition-all overflow-hidden" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                   <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser}`} alt="User" className="w-full h-full object-cover rounded-lg" />
                </div>
             </div>
          </header>
          
          <main className="flex-1 overflow-auto custom-scrollbar p-10">
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
              <Route path="/users" element={userRole === 'admin' ? <UserManagement /> : <Dashboard />} />
              <Route path="/audit" element={userRole === 'admin' ? <AuditVault /> : <Dashboard />} />
              <Route path="/mitre" element={<MitreMapping />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/docs" element={<Documentation />} />
            </Routes>
          </main>


          
          {showProfileMenu && (
             <div className="absolute top-14 right-8 w-72 bg-soc-panel border border-soc-border rounded-b-lg shadow-2xl z-[200] overflow-hidden animate-in slide-in-from-top-2 duration-300">
                <div className="p-5 border-b border-soc-border bg-soc-bg/40 flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-full border border-soc-primary p-1 bg-soc-bg">
                      <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser || 'admin'}`} alt="User" className="w-full h-full object-cover rounded-full" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-soc-primary uppercase tracking-widest leading-none mb-1">Authenticated Analyst</p>
                      <p className="text-lg font-black text-white tracking-tight leading-none">{currentUser || 'SYSTEM_ROOT'}</p>
                   </div>
                </div>
                 <div className="p-2 bg-[#050510]/60">
                   <div className="flex items-center justify-between text-[8px] font-black text-soc-muted uppercase tracking-widest px-2 mb-2">
                      <span>Neural Status</span>
                      <span className="text-soc-primary">Linked</span>
                   </div>
                   
                   <button 
                     onClick={handleLogout}
                     className="w-full flex items-center justify-between px-4 py-3 bg-soc-critical/5 hover:bg-soc-critical/20 border border-soc-critical/30 rounded-xl transition-all group/logout"
                   >
                      <span className="text-[10px] font-black text-soc-critical uppercase tracking-[0.2em]">End Session</span>
                      <LogOut size={16} className="text-soc-critical group-hover/logout:translate-x-1 transition-transform" />
                   </button>
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
           {/* Command Result Notification */}
           {commandFeedback && (
              <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[400] px-8 py-4 bg-[#050510]/95 backdrop-blur-2xl border-2 border-soc-${commandFeedback.type} rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-top-4 duration-500`}>
                 <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full bg-soc-${commandFeedback.type} animate-ping`}></div>
                    <span className={`text-xs font-black text-white uppercase tracking-[0.2em]`}>{commandFeedback.text}</span>
                 </div>
              </div>
           )}

           {/* Global VANGUARD Chatbot */}
           <OracleBot />

           {/* Quick-Action Command HUD */}
           <div className={`fixed top-0 left-0 w-full h-full z-[300] bg-soc-bg/80 backdrop-blur-md flex items-start justify-center pt-32 transition-all duration-500 ${isCommandBarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="w-full max-w-2xl bg-soc-panel border border-soc-primary/30 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                 <div className="p-4 border-b border-white/5 flex items-center space-x-4">
                    <Terminal size={20} className="text-soc-primary" />
                    <input 
                      autoFocus={isCommandBarOpen}
                      value={commandValue}
                      onChange={(e) => setCommandValue(e.target.value)}
                      placeholder="ENTER COMMAND (e.g. /isolate, /block, /clear)..."
                      className="flex-1 bg-transparent border-none outline-none text-soc-primary font-mono placeholder:text-soc-muted"
                      onKeyDown={(e) => { 
                        if (e.key === 'Escape') setIsCommandBarOpen(false); 
                        if (e.key === 'Enter') handleCommand(commandValue);
                      }}
                    />
                    <div className="px-2 py-1 border border-soc-border rounded text-[10px] text-soc-muted">ENTER to Execute</div>
                 </div>
                 <div className="p-4 space-y-2">
                    <p className="text-[10px] text-soc-muted uppercase tracking-widest px-2">Vanguard Intelligence Suggestions</p>
                    <div className="flex flex-wrap gap-2 p-2">
                       <button className="px-3 py-2 bg-soc-primary/5 hover:bg-soc-primary/10 border border-soc-primary/20 rounded-lg text-xs transition-colors">/system_overview</button>
                       <button className="px-3 py-2 bg-soc-critical/5 hover:bg-soc-critical/10 border border-soc-critical/20 rounded-lg text-xs text-soc-critical transition-colors">/isolate_host</button>
                       <button className="px-3 py-2 bg-soc-secondary/5 hover:bg-soc-secondary/10 border border-soc-secondary/20 rounded-lg text-xs text-soc-secondary transition-colors">/summarize_threats</button>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </Router>
  );
}

export default App;

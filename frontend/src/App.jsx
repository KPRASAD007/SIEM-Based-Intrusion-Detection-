import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
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
import { Shield, LayoutDashboard, Database, Activity, Briefcase, Settings, FileText, Target, Bell, X, Globe, Eye } from 'lucide-react';

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
    // Connect to WebSocket purely for live toast notifications
    const ws = new WebSocket(`ws://${window.location.hostname}:8080/api/logs/ws`);
    
    ws.onopen = () => console.log("Connected to SOC real-time stream");
    
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'NEW_ALERT') {
           const newAlert = payload.data;
           setLiveAlerts(prev => [newAlert, ...prev].slice(0, 3)); // Display last 3
           
           // Auto-dismiss the alert after 5.5 seconds
           setTimeout(() => {
             setLiveAlerts(currentAlerts => currentAlerts.filter(a => a._id !== newAlert._id));
           }, 5500);
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const dismissAlert = (id) => {
    setLiveAlerts(prev => prev.filter(a => a._id !== id));
  };

  if (!isAuthenticated) {
    return <Login onLogin={(username) => { setIsAuthenticated(true); setCurrentUser(username); }} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-soc-bg text-soc-text font-sans overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed lg:relative left-0 top-0 h-full bg-soc-panel border-r border-soc-border flex flex-col shadow-2xl z-[100] transition-all duration-300 ease-in-out overflow-hidden ${isSidebarVisible ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}`}>
          {isSidebarVisible && (
            <>
              <div className="p-6 flex items-center mb-4 transition-opacity duration-200">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-soc-primary to-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-soc-primary/20">
                  <Shield size={18} className="text-white" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-soc-text to-soc-muted">
                  CyberDetect
                </h1>
              </div>
              <nav className="flex-1 px-4 space-y-1">
                <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
                <SidebarItem to="/logs" icon={Database} label="Log Explorer" />
                <SidebarItem to="/alerts" icon={Activity} label="Alerts Center" />
                <SidebarItem to="/incidents" icon={Briefcase} label="Case Management" />
                <SidebarItem to="/sensors" icon={Globe} label="Remote Sensors" />
                <SidebarItem to="/web" icon={Eye} label="Web Surveillance" />
                <div className="pt-4 mt-4 border-t border-soc-border">
                  <p className="px-4 text-xs font-semibold text-soc-muted/50 uppercase tracking-wider mb-2">Simulate & Rules</p>
                  <SidebarItem to="/rules" icon={Settings} label="Detection Rules" />
                  <SidebarItem to="/mitre" icon={Target} label="MITRE ATT&CK" />
                  <SidebarItem to="/simulator" icon={Shield} label="Attack Simulator" />
                  <SidebarItem to="/docs" icon={FileText} label="Documentation" />
                </div>
              </nav>
              <div className="p-4 border-t border-soc-border text-xs text-soc-muted text-center">
                v1.0.0 SOC Environment
              </div>
            </>
          )}
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col relative w-full min-w-0">
          {/* Topbar */}
          <header className="h-16 bg-soc-panel/80 backdrop-blur-md border-b border-soc-border flex items-center justify-between px-8 absolute top-0 w-full z-[110]">
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                className="mr-4 p-2 text-soc-muted hover:bg-soc-border hover:text-white rounded-lg transition-all"
                title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
              >
                <LayoutDashboard size={20} className={isSidebarVisible ? "" : "text-soc-primary animate-pulse"} />
              </button>
              <span className="font-medium text-soc-text">Security Operations Center</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-soc-muted text-right">
                <div className="font-medium text-soc-success flex items-center justify-end">
                  <div className="w-2 h-2 rounded-full bg-soc-success mr-2 animate-pulse"></div>
                   Connection Active
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-soc-border overflow-hidden border border-soc-border cursor-pointer hover:ring-2 hover:ring-soc-primary transition-all" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Analyst" alt="User" />
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-soc-bg p-8 pt-24 custom-scrollbar">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/logs" element={<LogManagement />} />
              <Route path="/alerts" element={<AlertsCenter />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/sensors" element={<RemoteSensors />} />
              <Route path="/web" element={<WebSurveillance />} />
              <Route path="/rules" element={<RulesEngine />} />
              <Route path="/mitre" element={<MitreMapping />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/docs" element={<Documentation />} />
            </Routes>
          </main>
          
          {/* Profile Modal Overlay */}
          {showProfileMenu && (
            <div className="absolute top-16 right-8 w-80 bg-soc-panel border border-soc-border rounded-lg shadow-2xl z-50 overflow-hidden transform transition-all">
              <div className="p-4 border-b border-soc-border bg-gradient-to-r from-soc-bg to-soc-panel flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-soc-border overflow-hidden border border-soc-border">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Analyst" alt="User" />
                </div>
                <div>
                  <p className="font-bold text-soc-text">{currentUser || 'SOC Admin'}</p>
                  <p className="text-xs text-soc-success">Online & Authenticated</p>
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-semibold text-soc-muted mb-3 uppercase tracking-wider">Notification Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-soc-text mb-1">Critical Alert Email Recipient</label>
                    <input 
                      type="email" 
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      placeholder="admin@cyberdetect.local"
                      className="w-full bg-soc-bg border border-soc-border rounded px-3 py-2 text-sm text-soc-text focus:outline-none focus:border-soc-primary transition-colors"
                    />
                  </div>
                  <button 
                    onClick={saveProfile}
                    disabled={savingEmail}
                    className="w-full bg-soc-primary hover:bg-blue-600 text-white font-medium py-2 rounded text-sm transition-colors"
                  >
                    {savingEmail ? 'Saving...' : 'Save Preferences'}
                  </button>
                  {emailStatus && <p className={`text-xs text-center mt-2 ${emailStatus.includes('success') ? 'text-soc-success' : 'text-soc-danger'}`}>{emailStatus}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Live Alerts Toast Container */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
             {liveAlerts.map(alert => (
               <div key={alert._id} className="bg-soc-panel border-l-4 border-soc-danger text-soc-text p-4 rounded shadow-2xl w-80 flex items-start justify-between animate-toast">
                 <div className="flex items-start">
                   <Bell size={18} className="text-soc-danger mr-3 mt-1" />
                   <div>
                     <h4 className="font-bold text-sm">New Alert Detected</h4>
                     <p className="text-xs text-soc-muted mt-1">{alert.rule_name}</p>
                     <p className="text-xs text-soc-danger font-bold mt-1 uppercase">{alert.severity}</p>
                   </div>
                 </div>
                 <button onClick={() => dismissAlert(alert._id)} className="text-soc-muted hover:text-white">
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

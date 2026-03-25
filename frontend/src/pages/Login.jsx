import React, { useState } from 'react';
import { Shield, Lock, User } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegistering ? `http://${window.location.hostname}:8080/api/auth/register` : `http://${window.location.hostname}:8080/api/auth/login`;
      const payload = isRegistering 
        ? { username, password, alert_email: email } 
        : { username, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || (isRegistering ? 'Registration failed' : 'Invalid credentials'));
      }

      onLogin(username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const heroUrl = `http://${window.location.hostname}:8080/api/download/hero.png`;
  const logoUrl = `http://${window.location.hostname}:8080/api/download/logo.png`;

  return (
    <div className="min-h-screen bg-soc-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Cinematic Hero Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.2] scale-105"
        style={{ backgroundImage: `url(${heroUrl})` }}
      ></div>
      
      {/* Animated Scanline overlay */}
      <div className="absolute inset-0 z-10 opacity-20 pointer-events-none scanline"></div>

      <div className="max-w-md w-full z-20 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 relative group">
             <div className="absolute inset-0 bg-soc-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
             <img src={logoUrl} alt="CyberDetect Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-soc-primary/30 rounded-2xl p-2 bg-soc-panel/80" />
          </div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-soc-primary to-accent tracking-tighter uppercase italic">
            CyberDetect
          </h1>
          <p className="text-soc-muted mt-3 text-xs font-bold uppercase tracking-[0.3em] opacity-70">Secured Laboratory Environment</p>
        </div>

        <div className="bg-soc-panel/80 backdrop-blur-xl border border-soc-primary/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden p-10 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-soc-primary"></div>
          
          {error && (
            <div className="bg-soc-critical/10 border border-soc-critical/30 p-4 mb-8 rounded-lg text-xs font-bold text-soc-critical uppercase tracking-wider flex items-center">
              <Shield size={16} className="mr-3 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-soc-primary uppercase tracking-widest ml-1">Identity Provider</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-soc-primary text-soc-muted">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-soc-bg/50 border border-soc-border rounded-xl text-sm text-white focus:outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/30 focus:bg-soc-bg"
                  placeholder="USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-bold text-soc-primary uppercase tracking-widest ml-1">Intel Alerting Endpoint</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-soc-muted group-focus-within:text-soc-primary">
                     <span className="font-bold text-lg">@</span>
                  </div>
                  <input
                    type="email"
                    required={isRegistering}
                    className="w-full pl-12 pr-4 py-3 bg-soc-bg/50 border border-soc-border rounded-xl text-sm text-white focus:outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/30"
                    placeholder="analyst@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-soc-primary uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-soc-muted group-focus-within:text-soc-primary">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-soc-bg/50 border border-soc-border rounded-xl text-sm text-white focus:outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/30"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-soc-primary hover:bg-soc-hacker text-soc-bg rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] disabled:opacity-50 flex justify-center items-center mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-soc-bg/30 border-t-soc-bg rounded-full animate-spin"></div>
              ) : (
                isRegistering ? 'Initialize Profile' : 'Access Control Center'
              )}
            </button>
            
            <div className="text-center pt-2">
               <button 
                  type="button" 
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
                  className="text-[10px] font-bold text-soc-muted hover:text-soc-primary uppercase tracking-widest transition-colors"
               >
                 {isRegistering ? '« Back to Logon' : 'New Identity? Request Credentials'}
               </button>
            </div>
          </form>

          {!isRegistering && (
            <div className="mt-8 pt-6 border-t border-soc-border/50 text-center">
              <p className="text-[9px] font-mono text-soc-muted uppercase opacity-50">
                Authorized Lab Access Only. Log: <span className="text-soc-primary">admin</span> / <span className="text-soc-primary">admin</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Shield, Lock, User, Key } from 'lucide-react';


export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [adminKey, setAdminKey] = useState(''); // Secret clearance cipher


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegistering ? `http://127.0.0.1:8080/api/auth/register` : `http://127.0.0.1:8080/api/auth/login`;
      const payload = isRegistering 
        ? { username, password, alert_email: email, admin_key: adminKey } 
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

      // Success Path: Zero-Latency Handover
      setLoading(false);
      onLogin(username);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };


  const heroUrl = `http://127.0.0.1:8080/api/download/hero.png`;
  const logoUrl = `http://127.0.0.1:8080/api/download/logo.png`;

  return (
    <div className="min-h-screen bg-soc-bg flex items-center justify-center p-4 relative overflow-hidden font-orbitron selection:bg-soc-primary selection:text-soc-bg">
      {/* Glitch Overlay Effect */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-soc-panel via-soc-bg to-soc-bg mix-blend-multiply"></div>
      
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      {/* Hero Lighting Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-soc-primary/5 rounded-full blur-[150px] animate-pulse-slow z-0"></div>

      <div className="absolute inset-0 z-10 opacity-30 pointer-events-none scanline"></div>

      <div className="max-w-md w-full z-20 animate-in fade-in zoom-in-95 duration-[300ms] ease-out">

        <div className="text-center mb-12 relative">
          <div className="w-24 h-24 mx-auto mb-6 relative group flex items-center justify-center">
             <div className="absolute inset-0 bg-soc-primary blur-3xl opacity-30 group-hover:opacity-60 transition-all duration-700 animate-spin-slow"></div>
             {/* Neon Hexagon Logo Replacement */}
             <div className="w-full h-full border-2 border-soc-primary shadow-[inset_0_0_20px_rgba(0,243,255,0.5),0_0_20px_rgba(0,243,255,0.5)] transform rotate-45 relative z-10 flex items-center justify-center bg-soc-bg">
                <div className="w-16 h-16 border border-soc-secondary -rotate-45 flex items-center justify-center bg-soc-panel animate-pulse">
                   <Shield size={32} className="text-soc-primary" />
                </div>
             </div>
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-soc-primary to-soc-secondary tracking-[0.2em] uppercase drop-shadow-[0_0_20px_rgba(0,243,255,0.2)]">
            CYBER<span className="text-white">DETECT</span>
          </h1>
          <p className="text-soc-secondary mt-4 text-[10px] font-black uppercase tracking-[0.5em] font-mono">Restricted Neural Gateway</p>
        </div>

        <div className="bg-[#050510]/90 backdrop-blur-3xl border border-soc-primary/30 rounded-none shadow-[0_0_80px_rgba(0,243,255,0.15)] overflow-hidden p-10 relative font-mono">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-soc-primary to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-soc-primary"></div>
          <div className="absolute top-0 left-0 w-2 h-2 bg-soc-secondary"></div>
          
          {error && (
            <div className="bg-soc-critical/10 border-l-4 border-soc-critical p-4 mb-8 text-xs font-black text-soc-critical uppercase tracking-widest flex items-center animate-in slide-in-from-left-4">
              <Shield size={16} className="mr-3 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-soc-primary uppercase tracking-[0.3em] flex items-center">
                 <span className="text-soc-secondary mr-2">{'>'}</span> Operator ID
              </label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  className="w-full bg-transparent border-b-2 border-soc-border py-2 text-lg text-white font-black focus:outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/20"
                  placeholder="IDENTITY"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-soc-primary uppercase tracking-[0.3em] flex items-center">
                    <span className="text-soc-secondary mr-2">{'>'}</span> Comms Link
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      required={isRegistering}
                      className="w-full bg-transparent border-b-2 border-soc-border py-2 text-lg text-white font-black focus:outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/20"
                      placeholder="SIGNAL_PATH"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-soc-secondary uppercase tracking-[0.3em] flex items-center">
                    <Key size={14} className="mr-2" /> Clearance_Cipher
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      required={isRegistering}
                      className="w-full bg-soc-secondary/5 border-b-2 border-soc-secondary/30 py-2 text-lg text-soc-secondary font-black focus:outline-none focus:border-soc-secondary transition-all placeholder:text-soc-secondary/10 tracking-[0.8em]"
                      placeholder="ADMIN_MASTER_KEY"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                    />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] font-black text-soc-secondary/40 pointer-events-none tracking-widest uppercase">Encryption active</div>
                  </div>
                </div>
              </div>
            )}


            <div className="space-y-3">
              <label className="text-[10px] font-black text-soc-primary uppercase tracking-[0.3em] flex items-center">
                 <span className="text-soc-secondary mr-2">{'>'}</span> Decryption Phrase
              </label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  className="w-full bg-transparent border-b-2 border-soc-border py-2 text-lg text-white font-black focus:outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/20 tracking-[0.5em]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-5 bg-soc-primary/10 hover:bg-soc-primary text-soc-primary hover:text-[#000] border border-soc-primary font-black text-xs uppercase tracking-[0.4em] transition-all duration-300 disabled:opacity-50 flex justify-center items-center group overflow-hidden"
              >
                <span className="absolute w-2 h-full bg-white opacity-50 left-[-20%] skew-x-[-20deg] group-hover:left-[120%] transition-all duration-700 ease-in-out"></span>
                {loading ? (
                  <div className="flex items-center space-x-2">
                     <span className="w-2 h-2 bg-soc-bg animate-ping"></span>
                     <span>DECRYPTING...</span>
                  </div>
                ) : (
                  <span className="relative z-10">{isRegistering ? 'INITIALIZE BIOMETRICS' : 'ESTABLISH UPLINK'}</span>
                )}
              </button>
            </div>
            
            <div className="text-center pt-4">
               <button 
                  type="button" 
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
                  className="text-[10px] font-black text-soc-muted hover:text-soc-secondary uppercase tracking-[0.2em] transition-colors"
               >
                 {isRegistering ? '« ABORT & RETURN' : 'REQUEST NEW CLEARANCE'}
               </button>
            </div>
          </form>

          {!isRegistering && (
            <div className="mt-12 pt-6 border-t border-soc-border/50 text-center flex flex-col space-y-2">
              <p className="text-[9px] font-mono text-soc-secondary uppercase font-black tracking-widest">
                WARNING: LEVEL 5 CLEARANCE REQUIRED
              </p>
              <p className="text-[8px] font-mono text-soc-muted uppercase">
                DEFAULT: <span className="text-soc-primary">admin</span> // PASS: <span className="text-soc-primary">admin</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { Shield, Lock, User, Key } from 'lucide-react';


export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = `${API_BASE_URL}/api/auth/login`;
      const payload = { username, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMsg = 'Invalid credentials';
        try {
          const errData = await response.json();
          errorMsg = errData.detail || errorMsg;
        } catch (e) {
          // If we get an "Internal Server Error" string instead of JSON
          if (response.status === 500) {
            errorMsg = "DATABASE_OFFLINE: Failed to establish link with log vault.";
          } else {
            errorMsg = `COMM_ERROR: Server returned status ${response.status}`;
          }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // Success Path: Zero-Latency Handover
      setLoading(false);
      onLogin(username, data.access_token, data.role);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };


  const heroUrl = `${API_BASE_URL}/api/download/hero.png`;
  const logoUrl = `${API_BASE_URL}/api/download/logo.png`;

  return (
    <div className="min-h-screen bg-soc-bg flex items-center justify-center p-6 relative overflow-hidden selection:bg-soc-primary selection:text-soc-bg">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-soc-panel border border-soc-border rounded-2xl flex items-center justify-center shadow-2xl">
            <Shield size={40} className="text-soc-primary" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">
            CYBER<span className="text-soc-primary">DETECT</span>_LAB
          </h1>
          <p className="text-soc-muted text-[10px] uppercase tracking-[0.3em] mt-2 font-bold opacity-60">Security Operations Center Portal</p>
        </div>

        <div className="bg-soc-panel border border-soc-border rounded-3xl shadow-2xl p-10">
          {error && (
            <div className="bg-soc-critical/10 border-l-4 border-soc-critical p-4 mb-6 text-[10px] font-bold text-soc-critical uppercase tracking-widest flex items-center">
              <Shield size={16} className="mr-3 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-soc-muted uppercase tracking-widest px-1">Operator Identity</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-soc-muted">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full bg-soc-bg border border-soc-border rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/30"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-soc-muted uppercase tracking-widest px-1">Access Phrase</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-soc-muted">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full bg-soc-bg border border-soc-border rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-soc-primary transition-all placeholder:text-soc-muted/30"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-soc-primary text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Establishing Link..." : "Authenticate"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-soc-border/50 text-center">
            <p className="text-[9px] font-bold text-soc-muted uppercase tracking-widest">
              Secured by CyberDetect Infrastructure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

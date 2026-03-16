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
      const endpoint = isRegistering ? 'http://localhost:8000/api/auth/register' : 'http://localhost:8000/api/auth/login';
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

  return (
    <div className="min-h-screen bg-soc-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-soc-primary to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-soc-primary/20">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-soc-muted">
            CyberDetect Lab
          </h1>
          <p className="text-soc-muted mt-2">Security Operations Center Authentication</p>
        </div>

        <div className="bg-soc-panel border border-soc-border rounded-xl shadow-2xl overflow-hidden p-8">
          {error && (
            <div className="bg-soc-danger/20 border-l-4 border-soc-danger p-4 mb-6 rounded text-sm text-soc-text">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-soc-muted mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-soc-muted" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3 py-2 bg-soc-bg border border-soc-border rounded-lg text-soc-text focus:outline-none focus:border-soc-primary focus:ring-1 focus:ring-soc-primary transition-colors"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-soc-muted mb-2">Alert Notification Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <span className="text-soc-muted font-bold text-lg leading-none mt-1">@</span>
                  </div>
                  <input
                    type="email"
                    required={isRegistering}
                    className="w-full pl-10 pr-3 py-2 bg-soc-bg border border-soc-border rounded-lg text-soc-text focus:outline-none focus:border-soc-primary focus:ring-1 focus:ring-soc-primary transition-colors"
                    placeholder="analyst@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <p className="text-xs text-soc-muted mt-1">Critical alerts will be routed here instantly.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-soc-muted mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-soc-muted" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-3 py-2 bg-soc-bg border border-soc-border rounded-lg text-soc-text focus:outline-none focus:border-soc-primary focus:ring-1 focus:ring-soc-primary transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-soc-primary hover:bg-blue-600 text-white rounded-lg font-medium shadow-lg shadow-soc-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soc-primary focus:ring-offset-soc-panel disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isRegistering ? 'Register Analyst Profile' : 'Authenticate to SOC'
              )}
            </button>
            
            <div className="text-center mt-4">
               <button 
                  type="button" 
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
                  className="text-sm text-soc-primary/80 hover:text-soc-primary hover:underline transition-colors"
               >
                 {isRegistering ? 'Already have an account? Log in' : 'New Analyst? Register to receive alerts.'}
               </button>
            </div>
          </form>

          {!isRegistering && (
            <div className="mt-6 text-center text-sm text-soc-muted">
              <p>Use <span className="text-soc-text font-mono bg-soc-bg px-2 py-1 rounded">admin</span> / <span className="text-soc-text font-mono bg-soc-bg px-2 py-1 rounded">admin</span> for lab access.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

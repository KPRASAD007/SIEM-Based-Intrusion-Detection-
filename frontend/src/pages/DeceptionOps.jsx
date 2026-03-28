import React, { useState, useEffect } from 'react';
import { Target, Shield, AlertTriangle, Activity, Database, Server, Plus, Trash2, Heart, Zap } from 'lucide-react';

export default function DeceptionOps() {
  const [assets, setAssets] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, tokensRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:8080/api/deception/assets`),
        fetch(`http://${window.location.hostname}:8080/api/deception/tokens`)
      ]);
      const assetsData = await assetsRes.json();
      const tokensData = await tokensRes.json();
      setAssets(Array.isArray(assetsData) ? assetsData : []);
      setTokens(Array.isArray(tokensData) ? tokensData : []);
    } catch (e) {
      console.error("Failed to fetch deception data", e);
    }
    setLoading(false);
  };

  const deployNode = async () => {
     const types = ['server', 'database', 'workstation'];
     const type = types[Math.floor(Math.random() * types.length)];
     const id = Math.floor(1000 + Math.random() * 9000);
     const name = `${type === 'database' ? 'DB' : 'SRV'}-MOCK-${id}`;
     const ip = `10.0.5.${Math.floor(Math.random() * 254)}`;
     
     try {
       await fetch(`http://${window.location.hostname}:8080/api/deception/assets`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, type, ip, status: 'active', last_interaction: 'None' })
       });
       fetchData();
     } catch (e) { console.error(e); }
  };

  const generateToken = async () => {
    const types = ['credential', 'api_key', 'file'];
    const type = types[Math.floor(Math.random() * types.length)];
    const id = Math.floor(1000 + Math.random() * 9000);
    const name = `HONEY-TOKEN-${id}`;
    const value = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    try {
      await fetch(`http://${window.location.hostname}:8080/api/deception/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, value, type, risk_score: 85 })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center">
            <Target className="mr-4 text-soc-primary animate-pulse" size={36} /> DECEPTION_OPS_V1.0
          </h2>
          <p className="text-[10px] font-bold text-soc-muted tracking-[0.4em] mt-3">DEPLOYING MOCK ASSETS & HONEY-TOKENS FOR ADVERSARY ATTRITION</p>
        </div>
        <div className="flex space-x-4">
           <button 
             onClick={generateToken}
             className="px-6 py-3 bg-soc-primary/10 border-2 border-soc-primary/30 text-soc-primary rounded-xl hover:bg-soc-primary hover:text-soc-bg transition-all text-[10px] font-black uppercase tracking-widest italic flex items-center shadow-glow">
              <Plus size={16} className="mr-2" /> GENERATE_HONEY_TOKEN
           </button>
           <button 
             onClick={deployNode}
             className="px-6 py-3 bg-soc-panel/60 border-2 border-soc-border text-white rounded-xl hover:border-soc-primary hover:text-soc-primary transition-all text-[10px] font-black uppercase tracking-widest italic flex items-center shadow-xl">
              <Plus size={16} className="mr-2" /> DEPLOY_DECEPTION_NODE
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Honey Asset Grid */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
              <h3 className="text-sm font-black text-white italic tracking-widest uppercase mb-10 flex items-center">
                <Server className="mr-3 text-soc-primary" size={20} /> ACTIVE_DECEPTION_NODES
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {loading ? (
                   <div className="col-span-2 py-20 text-center animate-pulse text-soc-muted font-black text-xs uppercase tracking-[0.4em]">SYNCING_DECEPTION_GRID...</div>
                 ) : assets.length === 0 ? (
                   <div className="col-span-2 py-20 text-center opacity-30 text-soc-muted font-black text-xs uppercase tracking-[0.4em]">ZERO_NODES_DEPLOYED</div>
                 ) : assets.map(asset => (
                   <div key={asset.name} className={`bg-soc-bg border-2 p-6 rounded-[1.5rem] transition-all relative overflow-hidden group ${asset.status === 'breached' ? 'border-soc-critical shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-soc-border hover:border-soc-primary'}`}>
                      <div className={`absolute top-0 right-0 w-1.5 h-full ${asset.status === 'breached' ? 'bg-soc-critical' : 'bg-soc-primary'}`}></div>
                      <div className="flex items-center justify-between mb-4">
                         <div className={`p-3 rounded-xl bg-soc-bg border-2 ${asset.status === 'breached' ? 'border-soc-critical/30 text-soc-critical' : 'border-soc-primary/30 text-soc-primary'}`}>
                            {asset.type === 'database' ? <Database size={20} /> : <Server size={20} />}
                         </div>
                         <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border-2 ${asset.status === 'breached' ? 'bg-soc-critical text-white border-soc-critical' : 'bg-soc-primary/10 text-soc-primary border-soc-primary'}`}>
                            {asset.status}
                         </span>
                      </div>
                      <h4 className="text-lg font-black text-white italic tracking-tight uppercase group-hover:translate-x-1 transition-transform">{asset.name}</h4>
                      <p className="font-mono text-[10px] text-soc-muted mb-4">{asset.ip}</p>
                      <div className="flex items-center text-[8px] font-black text-soc-muted uppercase tracking-widest opacity-60">
                         <Activity size={10} className="mr-2" /> LAST_SYNC: {asset.last_interaction}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Honey Tokens Sidebar */}
        <div className="bg-soc-panel border-2 border-soc-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
           <h3 className="text-sm font-black text-white italic tracking-widest uppercase mb-10 flex items-center">
             <Zap className="mr-3 text-soc-warning" size={20} /> HONEY_TOKEN_SYNC
           </h3>

           <div className="space-y-6">
              {tokens.length === 0 ? (
                <div className="py-20 text-center opacity-30 text-soc-muted font-black text-xs uppercase tracking-[0.4em]">NO_TOKENS_ACTIVE</div>
              ) : tokens.map(token => (
                <div key={token.name} className="p-5 bg-soc-bg border-2 border-soc-border rounded-2xl hover:border-soc-warning transition-all group">
                   <div className="flex items-center justify-between mb-3 text-soc-muted group-hover:text-soc-warning transition-colors">
                      <span className="text-[10px] font-black uppercase tracking-widest">{token.type}</span>
                      <Target size={14} />
                   </div>
                   <p className="text-sm font-black text-white italic truncate mb-2">{token.name}</p>
                   <div className="flex items-center justify-between">
                      <code className="text-[9px] bg-soc-panel px-2 py-1 rounded text-soc-muted font-mono">{(token.value || '').slice(0, 15)}...</code>
                      <span className="text-[8px] font-black text-soc-warning">RISK_{token.risk_score}</span>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 p-6 bg-soc-warning/5 border-2 border-soc-warning/20 rounded-3xl text-center space-y-4">
              <AlertTriangle size={32} className="mx-auto text-soc-warning animate-pulse" />
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">WARNING_LOGS_ENABLED</p>
              <p className="text-[8px] text-soc-muted font-bold leading-relaxed uppercase opacity-60">ANY INTERACTION WITH THESE TOKENS TRIGGERS IMMEDIATE CRITICAL ALERT RESPONSE.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Hexagon, Loader2, ShieldAlert } from 'lucide-react';

export default function OracleBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'oracle', text: 'I am V.A.N.G.U.A.R.D. (Virtual Autonomous Network Guard & Unified Analytics Response Daemon). My subroutines are online. Authorized operational requests?', action: 'SYSTEM_ONLINE' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const messagesEndRef = useRef(null);

  const terminals = [
    { id: 'simulator', name: 'Attack Simulator', icon: '⚔️', desc: 'Simulate breaches and test defenses.' },
    { id: 'analyzer', name: 'Log Analyzer', icon: '🔍', desc: 'Sift through raw data for threat signals.' },
    { id: 'deception', name: 'Deception Ops', icon: '🎭', desc: 'Deploy traps and honeytokens.' },
    { id: 'cases', name: 'Case Management', icon: '📁', desc: 'Initialize and track security incidents.' },
    { id: 'dashboard', name: 'Command Center', icon: '🛰️', desc: 'Macroscopic overview of lab status.' }
  ];


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/oracle/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage.text })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { 
          sender: 'oracle', 
          text: data.reply,
          action: data.action
        }]);
      } else {
        setMessages(prev => [...prev, { sender: 'oracle', text: 'ERROR: Uplink to V.A.N.G.U.A.R.D. neural matrix severed.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'oracle', text: 'SYSERR: Unable to reach central command API.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Orb Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-[300] group outline-none transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] animate-vanguard-drift ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 hover:scale-110'}`}
      >
        <div className="absolute inset-[-15px] bg-white blur-[45px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
        <div className="absolute inset-[-25px] bg-soc-primary blur-[50px] rounded-full opacity-20 group-hover:opacity-60 transition-opacity"></div>
        <div className="absolute inset-[-20px] border border-white/30 rounded-full animate-energy-spin opacity-40 group-hover:opacity-80 transition-opacity"></div>
        
        <div className="w-24 h-24 bg-[#000] border-2 border-white/60 rounded-full flex items-center justify-center relative overflow-hidden shadow-[0_0_60px_rgba(255,255,255,1),inset_0_0_40px_rgba(0,243,255,0.8)] group-hover:border-white transition-all duration-500 hover:shadow-[0_0_100px_rgba(255,255,255,1)]">
          <img 
            src={`http://${window.location.hostname}:8080/api/download/vanguard_logo.png`} 
            alt="Vanguard AI" 
            className="w-[160%] h-[160%] object-cover absolute opacity-100 brightness-[1.8] contrast-[1.4] animate-vanguard-nova"
            style={{ filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 1))" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000]/40 via-transparent to-transparent opacity-30"></div>
          <div className="absolute bottom-2 w-3/4 h-[5px] bg-white opacity-90 shadow-[0_0_25px_rgba(255,255,255,1)] rounded-full animate-pulse"></div>
        </div>
        <div className="absolute -top-5 -left-5 bg-white text-[#000] text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full shadow-[0_0_30px_rgba(255,255,255,1)] animate-bounce font-orbitron border-2 border-soc-primary">LINK_ONLINE</div>
      </button>




      {/* Expanded Chat Interface */}
      <div 
        className={`fixed bottom-6 right-6 w-96 h-[600px] z-[200] flex flex-col bg-[#050510]/90 backdrop-blur-3xl border border-soc-primary/30 rounded-3xl shadow-[0_0_50px_rgba(0,243,255,0.1),inset_0_0_20px_rgba(0,243,255,0.05)] clip-path-cyber transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right font-orbitron ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}
      >
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-soc-primary/50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-soc-primary/50 pointer-events-none"></div>

        {/* Header */}
        <div className="p-5 border-b border-soc-primary/20 bg-soc-bg/40 flex items-center justify-between shrink-0 relative overflow-hidden cursor-pointer" onClick={() => setIsOpen(false)}>
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-soc-primary to-transparent opacity-50"></div>
            <div className="flex items-center space-x-3">
             <div className="w-10 h-10 border border-soc-primary/30 rounded-xl relative overflow-hidden bg-soc-bg shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                <img 
                  src={`http://${window.location.hostname}:8080/api/download/vanguard_logo.png`} 
                  alt="V" 
                  className="w-full h-full object-cover scale-125 animate-pulse"
                />
             </div>

             <div>
                <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase leading-none mb-1 text-transparent bg-clip-text bg-gradient-to-r from-soc-primary to-white">V.A.N.G.U.A.R.D</h3>
                <div className="flex items-center space-x-1">
                   <div className="w-1.5 h-1.5 bg-soc-primary rounded-full animate-pulse shadow-[0_0_5px_currentColor]"></div>
                   <span className="text-[8px] font-mono text-soc-primary/80 uppercase">Cognitive Node Linked</span>
                </div>
             </div>
           </div>
           <button className="text-soc-muted hover:text-white transition-colors p-2 text-[10px] uppercase font-black tracking-widest bg-soc-primary/10 rounded-lg hover:bg-soc-primary hover:text-soc-bg border border-soc-primary/20">
             HIDE
           </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar relative z-10">
            {messages.map((msg, idx) => {
              const parts = msg.text.split('**SIMPLIFIED INSIGHT:**');
              const technicalText = parts[0];
              const insightText = parts[1];

              return (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                  <div className={`max-w-[90%] p-4 rounded-2xl relative group ${msg.sender === 'user' ? 'bg-soc-primary/10 border border-soc-primary/30 rounded-tr-sm text-white' : 'bg-soc-panel/60 border border-soc-border rounded-tl-sm text-soc-primary/90'}`}>
                    {msg.sender === 'oracle' && (
                      <p className="text-[7px] font-black uppercase tracking-[0.3em] mb-2 opacity-50 flex items-center">
                        <Terminal size={8} className="mr-1" /> V.A.N.G.U.A.R.D. NEURAL_LOGIC
                      </p>
                    )}
                    <p className="text-xs leading-relaxed font-mono drop-shadow-[0_0_2px_rgba(0,243,255,0.2)]">{technicalText}</p>
                    
                    {insightText && (
                      <div className="mt-4 p-3 bg-white/5 border-l-4 border-soc-primary rounded-r-lg animate-in fade-in slide-in-from-left-2 duration-700">
                        <p className="text-[8px] font-black text-white uppercase tracking-widest mb-1 opacity-70">
                          🎯 The Bottom Line
                        </p>
                        <p className="text-[11px] font-bold text-white leading-tight">
                          {insightText}
                        </p>
                      </div>
                    )}

                    {msg.action && (
                      <div className="mt-3 p-2 bg-soc-bg border border-soc-primary/20 rounded flex items-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                        <ShieldAlert size={10} className="text-soc-warning mr-2 animate-pulse" />
                        <span className="text-[8px] font-black text-soc-warning uppercase tracking-widest">{msg.action}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] font-bold text-soc-muted uppercase mt-1 px-1">{msg.sender === 'user' ? 'ANALYST_DIRECTIVE' : 'RESPONSE_GENERATED'}</span>
                </div>
              );
            })}

           {loading && (
             <div className="flex items-start animate-in fade-in">
                <div className="bg-soc-panel/60 border border-soc-border p-4 rounded-2xl rounded-tl-sm flex items-center space-x-3">
                   <Loader2 size={14} className="text-soc-primary animate-spin" />
                   <span className="text-[9px] font-black text-soc-primary uppercase tracking-[0.2em] animate-pulse">PROCESSING_DIRECTIVE...</span>
                </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-soc-primary/20 bg-soc-bg/60 shrink-0 relative z-10">
           {showMentionMenu && (
             <div className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-[#0a0a1f] border border-soc-primary/30 rounded-2xl shadow-[0_-10px_40px_rgba(0,243,255,0.2)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-3 border-b border-soc-primary/10 bg-soc-primary/5">
                   <p className="text-[8px] font-black text-soc-primary uppercase tracking-widest">Select Core Terminal Reference</p>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                   {terminals.map(t => (
                     <button 
                        key={t.id}
                        onClick={() => {
                          setInput(input + `@${t.name} `);
                          setShowMentionMenu(false);
                        }}
                        className="w-full p-3 flex items-center space-x-3 hover:bg-soc-primary/10 transition-colors border-b border-white/5 last:border-0 group text-left"
                     >
                        <div className="w-8 h-8 rounded-lg bg-soc-bg border border-soc-primary/20 flex items-center justify-center text-sm group-hover:border-soc-primary transition-all">
                           {t.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[10px] font-black text-white uppercase tracking-wider mb-0.5">@{t.name}</p>
                           <p className="text-[8px] text-soc-muted truncate">{t.desc}</p>
                        </div>
                     </button>
                   ))}
                </div>
             </div>
           )}

           <form onSubmit={sendMessage} className="relative flex items-center group space-x-2">
              <button 
                type="button"
                onClick={() => setShowMentionMenu(!showMentionMenu)}
                className={`p-2 rounded-xl border transition-all duration-300 ${showMentionMenu ? 'bg-soc-primary text-soc-bg border-soc-primary' : 'bg-soc-primary/10 text-soc-primary border-soc-primary/20 hover:bg-soc-primary/20'}`}
              >
                <span className="text-lg font-black leading-none">+</span>
              </button>

              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-soc-primary/50 group-focus-within:text-soc-primary transition-colors">
                  <Terminal size={14} />
                </div>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInput(val);
                    if (val.endsWith('@')) setShowMentionMenu(true);
                  }}
                  onBlur={() => setTimeout(() => setShowMentionMenu(false), 200)}
                  placeholder="Declare directive or use @Mention..."
                  className="w-full bg-[#050510] border border-soc-primary/30 rounded-xl py-3 pl-9 pr-12 text-[10px] font-bold text-white tracking-widest placeholder:text-soc-muted/50 focus:outline-none focus:border-soc-primary focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all font-mono"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-soc-primary/10 text-soc-primary rounded-lg hover:bg-soc-primary hover:text-[#0b0e14] transition-all disabled:opacity-30 border border-soc-primary/20"
                >
                  <Send size={14} />
                </button>
              </div>
           </form>
        </div>

      </div>
    </>
  );
}

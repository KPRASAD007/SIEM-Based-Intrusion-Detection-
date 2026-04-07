import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Hexagon, Loader2, ShieldAlert } from 'lucide-react';

export default function OracleBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'oracle', text: 'I am V.A.N.G.U.A.R.D. (Virtual Autonomous Network Guard & Unified Analytics Response Daemon). My subroutines are online. Authorized operational requests?', action: 'SYSTEM_ONLINE' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
        className={`fixed bottom-6 right-6 z-[200] group outline-none transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 hover:scale-110'}`}
      >
        <div className="absolute inset-0 bg-soc-primary blur-[20px] rounded-full opacity-40 group-hover:opacity-100 animate-pulse transition-opacity"></div>
        <div className="w-16 h-16 bg-[#050510] border-2 border-soc-primary rounded-full flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.6)]">
          <Hexagon size={32} className="text-soc-primary absolute animate-spin-slow opacity-20" />
          <Terminal size={24} className="text-white relative z-10 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <div className="absolute bottom-1 w-2/3 h-[2px] bg-soc-primary opacity-50"></div>
        </div>
        <div className="absolute -top-3 -left-3 bg-soc-primary text-soc-bg text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-[0_0_10px_rgba(0,243,255,1)] animate-bounce font-orbitron">AI</div>
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
             <div className="p-2 bg-soc-primary/10 rounded-xl border border-soc-primary/30 relative">
                <Hexagon size={18} className="text-soc-primary animate-spin-slow absolute inset-auto opacity-30" />
                <Terminal size={18} className="text-soc-primary relative z-10" />
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
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                <div className={`max-w-[85%] p-4 rounded-2xl relative group ${msg.sender === 'user' ? 'bg-soc-primary/10 border border-soc-primary/30 rounded-tr-sm text-white' : 'bg-soc-panel/60 border border-soc-border rounded-tl-sm text-soc-primary/90'}`}>
                   {msg.sender === 'oracle' && (
                     <p className="text-[7px] font-black uppercase tracking-[0.3em] mb-2 opacity-50 flex items-center">
                        <Terminal size={8} className="mr-1" /> V.A.N.G.U.A.R.D. LOGIC
                     </p>
                   )}
                   <p className="text-xs leading-relaxed font-mono drop-shadow-[0_0_2px_rgba(0,243,255,0.2)]">{msg.text}</p>
                   {msg.action && (
                     <div className="mt-3 p-2 bg-soc-bg border border-soc-primary/20 rounded flex items-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                        <ShieldAlert size={10} className="text-soc-warning mr-2 animate-pulse" />
                        <span className="text-[8px] font-black text-soc-warning uppercase tracking-widest">{msg.action}</span>
                     </div>
                   )}
                </div>
                <span className="text-[8px] font-bold text-soc-muted uppercase mt-1 px-1">{msg.sender === 'user' ? 'ANALYST_DIRECTIVE' : 'RESPONSE_GENERATED'}</span>
             </div>
           ))}
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
           <form onSubmit={sendMessage} className="relative flex items-center group">
              <div className="absolute left-3 text-soc-primary/50 group-focus-within:text-soc-primary transition-colors">
                <Terminal size={14} />
              </div>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Declare directive to Vanguard..."
                className="w-full bg-[#050510] border border-soc-primary/30 rounded-xl py-3 pl-9 pr-12 text-[10px] font-bold text-white tracking-widest placeholder:text-soc-muted/50 focus:outline-none focus:border-soc-primary focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all font-mono"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="absolute right-2 p-2 bg-soc-primary/10 text-soc-primary rounded-lg hover:bg-soc-primary hover:text-[#0b0e14] transition-all disabled:opacity-30 border border-soc-primary/20"
              >
                <Send size={14} />
              </button>
           </form>
        </div>
      </div>
    </>
  );
}

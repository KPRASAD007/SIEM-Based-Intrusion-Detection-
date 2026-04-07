import React, { useState } from 'react';
import { Search, FileSearch, Shield, Terminal, Download, Upload, Cpu, Activity, AlertCircle, HardDrive } from 'lucide-react';

export default function Forensics() {
  const [terminalLogs, setTerminalLogs] = useState([
    "DETECT_LAB_OS v2.1.0 Initialized...",
    "Mounting /mnt/forensics_vault...",
    "Ready for deep packet inspection."
  ]);
  const [command, setCommand] = useState('');

  const executeCommand = (e) => {
    e.preventDefault();
    if (!command) return;
    const newLogs = [...terminalLogs, ` analyst@soc:~$ ${command}`];
    
    // Simple mock responses
    if (command.includes('netstat')) {
       newLogs.push("  TCP 10.0.5.122:443 -> 45.33.22.11:50122 (ESTABLISHED)");
    } else if (command.includes('whoami')) {
       newLogs.push("  system_root_administrator");
    } else if (command.includes('ls')) {
       newLogs.push("  dump_2026_03_25.pcap", "  malware_sample_hash.txt", "  syslog_export.csv");
    } else if (command.includes('clear')) {
       setTerminalLogs(["DETOTNATE_LAB_OS v2.1.0 Ready."]);
       setCommand('');
       return;
    } else {
       newLogs.push(`  Command '${command}' not found or permission denied.`);
    }
    
    setTerminalLogs(newLogs);
    setCommand('');
  };

  const detonateMalware = () => {
    const steps = [
      "UPLOAD: sample_3921.exe -> /tmp/sandbox_isolated",
      "STATUS: Hooking API calls (Kernel32.dll, Ntdll.dll)...",
      "BEHAVIOR: Attempting to modify HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      "NETWORK: Blocked C2 Connection to 103.221.x.x (Command & Control)",
      "FILE: Dropped temp_file.vbs in AppData/Local",
      "VERDICT: CRITICAL_MALWARE // RANSOMWARE_VARIANT_A1"
    ];
    
    steps.forEach((step, i) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, ` [REPL-ANALYZER] ${step}`]);
      }, i * 1000);
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 text-white">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-soc-border pb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center">
            <Search className="mr-4 text-accent animate-pulse" size={36} /> FORENSIC_SANDBOX_V1
          </h2>
          <p className="text-[10px] font-bold text-soc-muted tracking-[0.4em] mt-3">DEEP INVESTIGATION // TRAFFIC RECONSTRUCTION // ARTIFACT ANALYSIS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PCAP Artifacts */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col h-[600px]">
              <h3 className="text-sm font-black text-white italic tracking-widest uppercase mb-8 flex items-center shrink-0">
                <HardDrive className="mr-3 text-accent" size={20} /> EVIDENCE_VAULT
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                 {[
                   { name: 'attack_capture_001.pcap', size: '12.4 MB', date: '2026-03-25 04:30', status: 'analyzed' },
                   { name: 'suspicious_traffic_raw.pcap', size: '4.1 MB', date: '2026-03-25 05:12', status: 'pending' },
                   { name: 'exfiltration_attempt.pcap', size: '142 KB', date: '2026-03-24 23:55', status: 'critical' }
                 ].map((file, i) => (
                   <div key={i} className="p-5 bg-soc-bg border-2 border-soc-border rounded-2xl hover:border-accent transition-all group cursor-pointer">
                      <div className="flex items-center justify-between mb-3 text-[8px] font-black text-soc-muted uppercase tracking-widest">
                         <span>{file.date}</span>
                         <span className={file.status === 'critical' ? 'text-soc-critical' : 'text-accent'}>{file.status}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                         <div className="p-3 bg-soc-panel rounded-xl text-accent border border-accent/20">
                            <FileSearch size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-white italic truncate max-w-[150px]">{file.name}</p>
                            <p className="text-[10px] font-mono text-soc-muted">{file.size}</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              
              <button className="mt-8 w-full py-4 bg-accent/10 border-2 border-accent/30 text-accent rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-soc-bg transition-all italic flex items-center justify-center">
                 <Upload size={16} className="mr-2" /> UPLOAD_EVIDENCE_SOURCE
              </button>
           </div>
        </div>

        {/* Analyst Terminal */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-[#0b0e14] border-2 border-soc-border rounded-[2.5rem] p-1 shadow-2xl relative overflow-hidden flex flex-col h-[600px]">
              <div className="bg-soc-panel px-8 py-3 flex items-center justify-between border-b-2 border-soc-border">
                 <div className="flex items-center space-x-3">
                    <Terminal size={14} className="text-accent" />
                    <span className="text-[10px] font-black text-white uppercase italic tracking-widest">SEC_OPS_ANALYST_REPL</span>
                 </div>
                 <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-soc-critical/40"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-soc-warning/40"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-soc-primary/40"></div>
                 </div>
              </div>
              
              <div className="flex-1 p-8 font-mono text-xs overflow-y-auto custom-scrollbar-terminal space-y-2">
                 {terminalLogs.map((log, i) => (
                   <div key={i} className={log.startsWith(' analyst@soc') ? 'text-white font-bold' : 'text-accent/80'}>
                      {log}
                   </div>
                 ))}
                 <form onSubmit={executeCommand} className="flex items-center">
                    <span className="text-white font-bold mr-2">analyst@soc:~$</span>
                    <input 
                      type="text" 
                      autoFocus
                      className="flex-1 bg-transparent border-none outline-none text-accent font-bold placeholder-accent/30"
                      placeholder="Type diagnostic command..."
                      value={command}
                      onChange={e => setCommand(e.target.value)}
                    />
                 </form>
              </div>
              
              <div className="bg-soc-panel/50 px-8 py-4 flex items-center justify-between border-t border-soc-border">
                 <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                       <Cpu size={14} className="text-soc-muted" />
                       <span className="text-[9px] font-black text-soc-muted uppercase italic">CPU: 12%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                       <Activity size={14} className="text-soc-muted" />
                       <span className="text-[9px] font-black text-soc-muted uppercase italic">NET_S: 4.2 MBPS</span>
                    </div>
                 </div>
                 <div className="text-[9px] font-black text-soc-primary animate-pulse">TERMINAL_READY</div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div 
                onClick={detonateMalware}
                className="bg-soc-panel border-2 border-soc-border p-6 rounded-3xl flex items-center space-x-4 hover:border-soc-critical cursor-pointer transition-all group shadow-xl">
                 <div className="p-3 bg-soc-critical/10 border border-soc-critical/20 rounded-2xl text-soc-critical group-hover:bg-soc-critical group-hover:text-soc-bg transition-all">
                    <AlertCircle size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-soc-muted uppercase tracking-widest">Sandbox_Action</p>
                    <p className="text-sm font-black text-white italic tracking-tighter uppercase">DETONATE_MALWARE</p>
                 </div>
              </div>
              <div className="bg-soc-panel border-2 border-soc-border p-6 rounded-3xl flex items-center space-x-4 hover:border-accent cursor-pointer transition-all group">
                 <div className="p-3 bg-accent/10 border border-accent/20 rounded-2xl text-accent group-hover:bg-accent group-hover:text-soc-bg transition-all">
                    <Download size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-soc-muted uppercase tracking-widest">Quick_Action</p>
                    <p className="text-sm font-black text-white italic tracking-tighter uppercase">EXPORT_IOC_LIST</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

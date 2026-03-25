import React from 'react';
import { Book, FileCode, CheckCircle, Database, Server } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="border-b-4 border-soc-border pb-10 relative">
        <div className="absolute -bottom-1 left-0 w-32 h-2 bg-soc-primary"></div>
        <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase flex items-center">
          <Book className="mr-6 text-soc-primary" size={48} /> OPS_MANUAL_V2.1
        </h2>
        <p className="text-[10px] font-black text-soc-muted tracking-[0.4em] mt-5 uppercase opacity-60">CYBERDETECT LABORATORY // ADVANCED SIEM_ARCHITECTURE & OPERATIONAL PROTOCOLS</p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <div className="bg-soc-panel/30 backdrop-blur-3xl border-2 border-soc-border rounded-[3rem] p-12 shadow-[0_0_60px_rgba(0,0,0,0.4)] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <Server size={180} />
           </div>
           
           <div className="space-y-12 relative z-10">
            <section className="space-y-6">
              <h3 className="text-2xl font-black text-white italic tracking-tighter border-l-4 border-soc-primary pl-6 uppercase flex items-center">
                <Server className="mr-4 text-soc-primary" size={24}/> ARCHITECTURE_CORE
              </h3>
              <p className="text-base text-soc-muted font-bold italic leading-relaxed pl-7 opacity-80">
                CyberDetect Lab is a high-fidelity Security Operations Center (SOC) simulation environment. The core stack utilizes a <strong className="text-white">FastAPI</strong> backend for low-latency log ingestion, <strong className="text-white">MongoDB</strong> for scalable adversarial data storage, and a <strong className="text-white">React.js</strong> command interface optimized for industrial SOC operations.
              </p>
            </section>

            <section className="space-y-6">
              <h3 className="text-2xl font-black text-white italic tracking-tighter border-l-4 border-soc-warning pl-6 uppercase flex items-center">
                <Database className="mr-4 text-soc-warning" size={24}/> TELEMETRY_PIPELINE
              </h3>
              <div className="pl-7 space-y-6">
                <p className="text-base text-soc-muted font-bold italic leading-relaxed opacity-80">
                  Global log ingestion is processed via the <code className="bg-soc-bg border border-soc-border px-3 py-1 rounded-xl text-soc-warning font-mono italic">/api/logs</code> gateway. The internal Detection Engine evaluates 100% of incoming signals against serialized logic gates defined in the <span className="text-soc-primary">Rules Center</span>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "LOGIC_SUPPORT: EQUALS, CONTAINS, G_REGEX",
                    "SIGNAL_ALERT: REAL_TIME_WS_BROADCAST",
                    "DOCKET_SYSTEM: STRUCTURED_INCIDENT_ESCALATION",
                    "FORENSIC_SYNC: AUTOMATED_TELEMETRY_LINKING"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-4 bg-soc-bg/50 border-2 border-soc-border p-4 rounded-2xl">
                       <div className="w-2 h-2 rounded-full bg-soc-primary animate-pulse"></div>
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-2xl font-black text-white italic tracking-tighter border-l-4 border-soc-critical pl-6 uppercase flex items-center">
                <FileCode className="mr-4 text-soc-critical" size={24}/> ADVERSARY_EMULATION
              </h3>
              <p className="text-base text-soc-muted font-bold italic leading-relaxed pl-7 opacity-80">
                The Lab includes a modular Fire-Range for adversary emulation. By triggering <strong className="text-soc-critical">LIVE_FIRE</strong> scenarios, the system injects high-fidelity Sysmon logs modeling complex MITRE TTPs, allowing analysts to stress-test detection rulesets in a safe, controlled sandbox.
              </p>
            </section>

            <section className="space-y-6">
              <h3 className="text-2xl font-black text-white italic tracking-tighter border-l-4 border-soc-secondary pl-6 uppercase flex items-center">
                <CheckCircle className="mr-4 text-soc-secondary" size={24}/> THREAT_INTEL_LAYER
              </h3>
              <p className="text-base text-soc-muted font-bold italic leading-relaxed pl-7 opacity-80">
                Signals containing external IP identifiers are automatically routed through the Global Enrichment Layer. Integration with mock <strong className="text-soc-secondary">AbuseIPDB</strong> and <strong className="text-soc-secondary">OTX AlienVault</strong> sensors provides critical reputation scoring and malicious infrastructure context directly in the investigation docket.
              </p>
            </section>
           </div>
        </div>

        <div className="bg-soc-bg border-4 border-soc-border rounded-[3rem] p-10 flex items-center justify-between shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-soc-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
           <div className="flex items-center space-x-8 relative z-10">
              <div className="p-6 bg-soc-primary/10 rounded-[2rem] border-2 border-soc-primary/30 text-soc-primary">
                 <Server size={32} />
              </div>
              <div>
                 <p className="text-xl font-black text-white italic tracking-tighter uppercase">SYSTEM_READY_FOR_DEPLOYMENT</p>
                 <p className="text-[9px] text-soc-muted font-bold tracking-[0.3em] uppercase opacity-50">VERIFIED_STABLE_BUILD_V2.1.0-LAB</p>
              </div>
           </div>
           <button className="px-10 py-4 bg-soc-primary text-soc-bg rounded-2xl font-black text-[10px] uppercase tracking-widest italic hover:scale-105 active:scale-95 transition-all shadow-xl relative z-10">
              INITIALIZE_LABS
           </button>
        </div>
      </div>
    </div>
  );
}

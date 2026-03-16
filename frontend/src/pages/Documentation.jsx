import React from 'react';
import { Book, FileCode, CheckCircle, Database, Server } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold flex items-center text-soc-text">
          <Book className="mr-3 text-soc-primary" size={32} /> Documentation
        </h2>
        <p className="text-soc-muted mt-2">CyberDetect Lab - Advanced SIEM-based Intrusion Detection Dashboard</p>
      </div>

      <div className="bg-soc-panel border border-soc-border rounded-lg p-8 shadow-lg space-y-6 text-soc-text">
        <section>
          <h3 className="text-xl font-bold border-b border-soc-border pb-2 mb-4 flex items-center">
            <Server className="mr-2 text-soc-success" size={20}/> Architecture Overview
          </h3>
          <p className="text-sm text-soc-muted leading-relaxed">
            CyberDetect Lab simulates a modern Security Operations Center (SOC). It utilizes a <strong>FastAPI</strong> backend for high-performance log ingestion and rule evaluation, a <strong>MongoDB</strong> database for flexible schema-less data storage, and a <strong>React.js</strong> frontend with TailwindCSS for a dark-mode, professional cyber analyst interface.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-soc-border pb-2 mb-4 flex items-center">
            <Database className="mr-2 text-soc-warning" size={20}/> Log Ingestion & Detection Engine
          </h3>
          <p className="text-sm text-soc-muted leading-relaxed mb-4">
            Logs are ingested via the <code className="bg-soc-bg px-1 py-0.5 rounded text-soc-warning">/api/logs</code> endpoint. In real-time, the Advanced Detection Engine evaluates incoming events against active rules defined in the <strong>Rules Engine</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-soc-muted">
            <li>Rules support <code className="text-soc-primary">equals</code>, <code className="text-soc-primary">contains</code>, and <code className="text-soc-primary">regex</code> operators.</li>
            <li>When a rule matches, an <strong>Alert</strong> is generated and broadcasted via WebSockets.</li>
            <li>Alerts can be escalated into structured <strong>Cases (Incidents)</strong> for analyst tracking.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-soc-border pb-2 mb-4 flex items-center">
            <FileCode className="mr-2 text-soc-danger" size={20}/> Attack Simulator
          </h3>
          <p className="text-sm text-soc-muted leading-relaxed">
            The built-in adversary emulation module generates synthetic Sysmon logs modeling 13 specific MITRE ATT&CK techniques. 
            Activating a scenario immediately injects logs into the pipeline, triggering rules and populating the Alerts Center to validate the SIEM's effectiveness without requiring real malware.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold border-b border-soc-border pb-2 mb-4 flex items-center">
            <CheckCircle className="mr-2 text-soc-primary" size={20}/> Threat Intel & Enrichments
          </h3>
          <p className="text-sm text-soc-muted leading-relaxed">
            Alerts containing IP addresses are enriched using integrated Threat Intelligence data (mocked from AbuseIPDB, AlienVault OTX, and VirusTotal) to provide reputation scores and malicious context directly in the analyst workflow.
          </p>
        </section>
      </div>
    </div>
  );
}

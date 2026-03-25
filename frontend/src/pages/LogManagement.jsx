import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';

export default function LogManagement() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    fetch(`http://${window.location.hostname}:8080/api/logs`)
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const exportLogsToJSON = () => {
    if (logs.length === 0) return;
    
    // Create a Blob from the JSON data
    const jsonString = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a temporary DOM element to trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soc_logs_export_${new Date().toISOString().slice(0, 10)}.json`;
    
    // Append -> click -> remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soc-text">Log Explorer</h2>
          <p className="text-sm text-soc-muted mt-1">Search and filter ingested security logs</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchLogs} className="flex items-center px-4 py-2 bg-soc-panel border border-soc-border rounded hover:border-soc-primary hover:text-soc-primary transition-colors text-sm">
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-soc-panel border border-soc-border rounded hover:bg-soc-border transition-colors text-sm">
            <Filter size={16} className="mr-2" /> Filter
          </button>
          <button 
            onClick={exportLogsToJSON}
            disabled={logs.length === 0}
            className={`flex items-center px-4 py-2 rounded transition-colors text-sm shadow-lg ${logs.length === 0 ? 'bg-soc-border text-soc-muted cursor-not-allowed shadow-none' : 'bg-soc-primary text-white hover:bg-blue-600 shadow-soc-primary/20'}`}
          >
            <Download size={16} className="mr-2" /> {logs.length === 0 ? 'No Data to Export' : 'Export JSON'}
          </button>
        </div>
      </div>

      <div className="bg-soc-panel border border-soc-border rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-soc-border flex items-center bg-soc-bg/50">
          <Search size={20} className="text-soc-muted mr-3" />
          <input 
            type="text" 
            placeholder="Search logs (e.g., process_name:powershell.exe)..." 
            className="w-full bg-transparent border-none outline-none text-soc-text placeholder-soc-muted"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-soc-bg text-soc-muted border-b border-soc-border">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Event ID</th>
                <th className="px-6 py-4 font-medium">Computer</th>
                <th className="px-6 py-4 font-medium">Process</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Source IP</th>
                <th className="px-6 py-4 font-medium">Event Type</th>
                <th className="px-6 py-4 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-soc-muted">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-soc-muted">No logs found in the database. Run the simulator to generate some.</td></tr>
              ) : (
                logs.map(log => {
                  // Ensure UTC parsing for correct local time mapping
                  const d = new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z');
                  const timeString = d.toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric', 
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                  });
                  return (
                    <tr key={log.id} className="hover:bg-soc-bg/40 cursor-pointer transition-colors">
                      <td className="px-6 py-4 text-soc-muted font-mono text-xs whitespace-nowrap">{timeString}</td>
                      <td className="px-6 py-4">{log.event_id || '-'}</td>
                      <td className="px-6 py-4 text-soc-text">{log.details?.host || log.details?.Computer || '-'}</td>
                      <td className="px-6 py-4">{log.process_name || '-'}</td>
                      <td className="px-6 py-4">{log.user || '-'}</td>
                      <td className="px-6 py-4 text-blue-400 font-mono">{log.ip_address || '-'}</td>
                      <td className="px-6 py-4">{log.event_type || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium bg-soc-bg border border-soc-border
                          ${log.severity?.toLowerCase() === 'high' || log.severity?.toLowerCase() === 'critical' ? 'text-soc-danger border-soc-danger/30' : 
                            log.severity?.toLowerCase() === 'medium' ? 'text-soc-warning border-soc-warning/30' : 'text-soc-muted'}`}>
                          {log.severity ? log.severity.toUpperCase() : 'LOW'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

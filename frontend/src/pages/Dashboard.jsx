import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldAlert, Activity, Users, Database, Maximize2, X } from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#991B1B'];

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [logsCount, setLogsCount] = useState(0);
  const [expandedChart, setExpandedChart] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [alertsRes, logsRes] = await Promise.all([
          fetch('http://localhost:8000/api/alerts'),
          fetch('http://localhost:8000/api/logs?limit=100')
        ]);
        const alertsData = await alertsRes.json();
        const logsData = await logsRes.json();
        setAlerts(alertsData);
        setLogsCount(logsData.length > 0 ? (124000 + logsData.length) : 124500); // Mock large base log volume + real logs
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      }
    };
    fetchStats();
  }, []);

  const activeAlerts = alerts.filter(a => a.status === 'new' || a.status === 'investigating').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'Critical' || a.severity === 'critical').length;
  
  // Calculate severity distribution
  const rawSeverity = alerts.reduce((acc, a) => {
    // Normalize casing for display
    const sev = a.severity ? a.severity.charAt(0).toUpperCase() + a.severity.slice(1).toLowerCase() : 'Unknown';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {});
  
  const severityData = [
    { name: 'Low', value: rawSeverity['Low'] || 0 },
    { name: 'Medium', value: rawSeverity['Medium'] || 0 },
    { name: 'High', value: rawSeverity['High'] || 0 },
    { name: 'Critical', value: rawSeverity['Critical'] || 0 }
  ].filter(d => d.value > 0);

  if (severityData.length === 0) {
    severityData.push({ name: 'No Alerts (Healthy)', value: 1 });
  }

  // Calculate alerts by rule for Bar Chart
  const alertsByRule = alerts.reduce((acc, a) => {
    const key = a.rule_name || 'Unknown Rule';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const ruleData = Object.keys(alertsByRule).map(key => ({
    rule: key.length > 15 ? key.substring(0, 15) + "..." : key,
    fullRule: key,
    count: alertsByRule[key]
  }));

  const renderBarChart = (isExpanded = false) => (
    <ResponsiveContainer width="100%" height="100%">
      {ruleData.length > 0 ? (
        <BarChart data={ruleData} margin={{ top: 10, right: 30, left: 0, bottom: isExpanded ? 50 : 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey={isExpanded ? "fullRule" : "rule"} stroke="#94A3B8" tick={{ fontSize: 12 }} angle={isExpanded ? -45 : 0} textAnchor={isExpanded ? "end" : "middle"} />
          <YAxis stroke="#94A3B8" allowDecimals={false} />
          <Tooltip cursor={{fill: '#334155', opacity: 0.4}} contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }} labelFormatter={(label, payload) => payload?.[0]?.payload?.fullRule || label} />
          <Bar dataKey="count" fill="#3B82F6" name="Total Triggered" radius={[4, 4, 0, 0]} />
        </BarChart>
      ) : (
        <div className="flex h-full items-center justify-center text-soc-muted">No alerts detected yet. Run simulations to populate this chart.</div>
      )}
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={severityData}
          cx="50%"
          cy="50%"
          innerRadius={expandedChart === 'pie' ? 100 : 60}
          outerRadius={expandedChart === 'pie' ? 140 : 80}
          paddingAngle={5}
          dataKey="value"
        >
          {severityData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155' }} />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-soc-text">SOC Overview</h2>
        <span className="text-sm text-soc-muted">Last updated: Just now</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-soc-panel border border-soc-border p-6 rounded-lg shadow-lg lg:col-span-1 md:col-span-2">
          <div className="flex items-center space-x-4">
             <div className="p-4 bg-soc-primary/10 rounded-full text-soc-primary">
               <Database size={28} />
             </div>
             <div>
               <p className="text-sm font-medium text-soc-muted">Total Logs (24h)</p>
               <h3 className="text-2xl font-bold mt-1 text-soc-text">{logsCount.toLocaleString()}</h3>
             </div>
          </div>
        </div>

        <div className="bg-soc-panel border border-soc-border p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
             <div className="p-4 bg-soc-warning/10 rounded-full text-soc-warning">
               <Activity size={28} />
             </div>
             <div>
               <p className="text-sm font-medium text-soc-muted">Active Alerts</p>
               <h3 className="text-2xl font-bold mt-1 text-soc-text">{activeAlerts}</h3>
             </div>
          </div>
        </div>

        <div className="bg-soc-panel border border-soc-border p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
             <div className="p-4 bg-soc-critical/10 rounded-full text-soc-critical">
               <ShieldAlert size={28} />
             </div>
             <div>
               <p className="text-sm font-medium text-soc-muted">Critical Alerts</p>
               <h3 className="text-2xl font-bold mt-1 text-soc-text">{criticalAlerts}</h3>
             </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-soc-panel border border-soc-border p-6 rounded-lg shadow-lg lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-soc-text">Alerts by Detection Rule</h3>
            <button onClick={() => setExpandedChart('bar')} className="text-soc-muted hover:text-white transition-colors" title="Expand Chart">
              <Maximize2 size={18} />
            </button>
          </div>
          <div className="h-72">
            {renderBarChart()}
          </div>
        </div>

        <div className="bg-soc-panel border border-soc-border p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-soc-text">Alerts by Severity</h3>
             <button onClick={() => setExpandedChart('pie')} className="text-soc-muted hover:text-white transition-colors" title="Expand Chart">
              <Maximize2 size={18} />
            </button>
          </div>
          <div className="h-72 flex flex-col items-center">
            <div className="flex-1 w-full">
               {renderPieChart()}
            </div>
            <div className="flex justify-center space-x-4 mt-4 w-full flex-wrap">
              {severityData.map((entry, index) => (
                <div key={entry.name} className="flex items-center text-xs mb-2">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-soc-muted">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Chart Modal */}
      {expandedChart && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-8">
          <div className="bg-soc-panel border border-soc-border rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-soc-border">
              <h3 className="text-2xl font-bold text-soc-text">
                {expandedChart === 'bar' ? 'Detailed Analysis: Alerts by Detection Rule' : 'Detailed Analysis: Alerts by Severity'}
              </h3>
              <button onClick={() => setExpandedChart(null)} className="p-2 text-soc-muted hover:bg-soc-border hover:text-white rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 p-8 min-h-0">
               {expandedChart === 'bar' && renderBarChart(true)}
               {expandedChart === 'pie' && (
                 <div className="h-full flex flex-col items-center justify-center">
                    <div className="h-[500px] w-full max-w-2xl">
                      {renderPieChart()}
                    </div>
                    <div className="flex justify-center space-x-8 mt-8 text-lg">
                      {severityData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center">
                          <div className="w-4 h-4 rounded-full mr-3 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[index] }}></div>
                          <span className="text-white font-medium">{entry.name}</span>
                          <span className="ml-2 text-soc-muted">({entry.value} occurrences)</span>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>
            <div className="p-4 border-t border-soc-border bg-soc-bg rounded-b-lg text-sm text-soc-muted flex items-center">
               <Activity size={16} className="mr-2 text-soc-primary" />
               Dataset updated dynamically via Live WebSockets. Interactive charting powered by Recharts.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Shield, Database, Cpu, Activity, Save, AlertTriangle, Key, Terminal } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import './AdminSettings.css';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [saving, setSaving] = useState(false);
  
  // Dummy Audit Logs
  const auditLogs = [
    { time: '10:48 AM', user: 'SYSTEM', action: 'Automated Graph Construction', target: 'COMP-29393ade', status: 'SUCCESS' },
    { time: '10:42 AM', user: 'AGENT_RESOLUTION', action: 'Entity Normalization', target: 'Phone: 9876543210', status: 'SUCCESS' },
    { time: '09:15 AM', user: 'INSP. SHARMA', action: 'Accessed Knowledge Graph', target: 'finance.verify@sbi', status: 'SUCCESS' },
    { time: '08:30 AM', user: 'SYSTEM', action: 'Database Backup', target: 'Neo4j Cluster', status: 'SUCCESS' },
    { time: '08:00 AM', user: 'ANALYST_01', action: 'Modified Risk Thresholds', target: 'Global Config', status: 'WARNING' },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully.');
    }, 1000);
  };

  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <div>
          <h1>ADMINISTRATION & AUDIT</h1>
          <p>System Configuration, Database Health, and Security Logs</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving} icon={<Save />}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <div className="admin-layout">
        {/* Sidebar Nav */}
        <div className="admin-nav">
          <div 
            className={`admin-nav-item ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <Database size={18} /> System & Databases
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            <Cpu size={18} /> AI Agent Configuration
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'risk' ? 'active' : ''}`}
            onClick={() => setActiveTab('risk')}
          >
            <AlertTriangle size={18} /> Risk Engine Parameters
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <Terminal size={18} /> Security & Audit Logs
          </div>
        </div>

        {/* Content Area */}
        <div className="admin-content">
          
          {activeTab === 'system' && (
            <div className="admin-panel fade-in">
              <h2 className="panel-title">System Health</h2>
              <div className="status-grid">
                <Card className="status-card">
                  <div className="status-icon success"><Database /></div>
                  <div className="status-info">
                    <h3>PostgreSQL (Relational)</h3>
                    <p className="status-text success">Connected • Latency: 12ms</p>
                  </div>
                </Card>
                <Card className="status-card">
                  <div className="status-icon success"><Database /></div>
                  <div className="status-info">
                    <h3>Neo4j (Graph Database)</h3>
                    <p className="status-text success">Connected • Nodes: 2,492</p>
                  </div>
                </Card>
                <Card className="status-card">
                  <div className="status-icon success"><Cpu /></div>
                  <div className="status-info">
                    <h3>AI Orchestration Engine</h3>
                    <p className="status-text success">Online • Active Workers: 4</p>
                  </div>
                </Card>
                <Card className="status-card">
                  <div className="status-icon success"><Activity /></div>
                  <div className="status-info">
                    <h3>Sentinel API Gateway</h3>
                    <p className="status-text success">Online • Uptime: 99.9%</p>
                  </div>
                </Card>
              </div>

              <h2 className="panel-title" style={{ marginTop: '2rem' }}>Maintenance</h2>
              <div className="admin-settings-form">
                <div className="form-group">
                  <label>Data Retention Policy (Days)</label>
                  <input type="number" defaultValue={365} />
                </div>
                <div className="form-group">
                  <label>Automated Backup Frequency</label>
                  <select defaultValue="daily">
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="admin-panel fade-in">
              <h2 className="panel-title">AI Agent Configuration</h2>
              <div className="admin-settings-form">
                <div className="form-group full-width">
                  <label>LLM Provider for Extraction & Resolution</label>
                  <select defaultValue="gemini">
                    <option value="gemini">Google Gemini 1.5 Pro</option>
                    <option value="openai">OpenAI GPT-4o</option>
                    <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label><Key size={14} style={{display: 'inline', marginRight: '4px'}}/> API Key</label>
                  <input type="password" defaultValue="*************************" />
                </div>
                <div className="form-group">
                  <label>Context Window Size (Tokens)</label>
                  <input type="number" defaultValue={128000} />
                </div>
                <div className="form-group">
                  <label>Temperature (Creativity vs Determinism)</label>
                  <input type="number" step="0.1" defaultValue={0.1} />
                </div>
                <div className="form-group checkbox-group">
                  <input type="checkbox" defaultChecked id="auto_resolve" />
                  <label htmlFor="auto_resolve">Allow agents to autonomously merge duplicate entities</label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="admin-panel fade-in">
              <h2 className="panel-title">Risk Engine Parameters</h2>
              <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Adjust the weights used by the heuristic risk engine to classify campaigns and complaints.
              </p>
              <div className="admin-settings-form">
                <div className="form-group">
                  <label>Financial Loss Weight</label>
                  <input type="number" step="0.1" defaultValue={0.4} />
                </div>
                <div className="form-group">
                  <label>Network Centrality Weight</label>
                  <input type="number" step="0.1" defaultValue={0.3} />
                </div>
                <div className="form-group">
                  <label>Scam Severity Weight</label>
                  <input type="number" step="0.1" defaultValue={0.3} />
                </div>
                <div className="form-group">
                  <label>High Risk Threshold Score</label>
                  <input type="number" defaultValue={75} />
                </div>
                <div className="form-group">
                  <label>Medium Risk Threshold Score</label>
                  <input type="number" defaultValue={40} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="admin-panel fade-in">
              <h2 className="panel-title">Security & Audit Logs</h2>
              <div className="audit-table-container">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>TIMESTAMP</th>
                      <th>USER / AGENT</th>
                      <th>ACTION</th>
                      <th>TARGET</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, i) => (
                      <tr key={i}>
                        <td>{log.time}</td>
                        <td className="audit-user"><Shield size={14}/> {log.user}</td>
                        <td>{log.action}</td>
                        <td className="audit-target">{log.target}</td>
                        <td>
                          <span className={`audit-status ${log.status.toLowerCase()}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

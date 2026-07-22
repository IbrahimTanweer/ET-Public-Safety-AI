import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';
import type { ComplaintResponse } from '../../lib/api';
import './CaseIntake.css';
import { ShieldAlert, Activity } from 'lucide-react';

export const CaseIntake: React.FC = () => {
  const [complaintText, setComplaintText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplaintResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;
    
    setLoading(true);
    try {
      const data = await api.submitComplaint(complaintText);
      setResult(data);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to analyze complaint. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="case-intake fade-in">
      <h1 className="text-2xl font-bold mb-6">Case Intake</h1>
      
      <div className="intake-grid">
        {/* Left Column: Input */}
        <Card title="Register New Case" className="input-card">
          <form onSubmit={handleSubmit} className="flex-col gap-4 h-full flex">
            <textarea
              className="complaint-input"
              placeholder="Paste raw complaint text here... (e.g. 'I received a call from 9876543210 claiming to be from FedEx...')"
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              disabled={loading}
            />
            <div className="mt-auto">
              <Button type="submit" disabled={loading || !complaintText.trim()} className="w-full">
                {loading ? 'Analyzing via AI...' : 'Submit & Analyze'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Center Column: Entities */}
        <Card title="Extracted Entities" className="entities-card">
          {loading ? (
            <div className="text-secondary p-4 flex items-center gap-2">
              <Activity className="animate-pulse" /> Extraction in progress...
            </div>
          ) : result?.is_duplicate ? (
            <div className="flex-col gap-4 p-4">
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-3 text-critical">
                <ShieldAlert size={24} />
                <div className="flex flex-col">
                  <span className="font-bold text-lg">Duplicate Detected</span>
                  <span className="text-sm opacity-90">This exact complaint was already submitted. Merged with {result.complaint_id}</span>
                </div>
              </div>
              <div className="text-sm text-secondary mt-2">
                Tip for Demo: If you want to see the extraction run again, change a word or add a space to the complaint text so the system sees it as a new case.
              </div>
            </div>
          ) : result?.entities_extracted ? (
            <div className="flex-col gap-4">
              {Object.entries(result.entities_extracted).map(([key, value]) => {
                if (!value) return null;
                return (
                  <div key={key} className="entity-row">
                    <span className="entity-label">{key.toUpperCase()}</span>
                    <span className="entity-value">{value}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-secondary p-4">Submit a case to view extracted entities.</div>
          )}
        </Card>

        {/* Right Column: Audit Logs & Timeline */}
        <Card title="AI Investigation Audit" className="audit-card">
          {loading ? (
            <div className="text-secondary p-4 flex items-center gap-2">
              <Activity className="animate-pulse" /> Reconstructing timeline...
            </div>
          ) : result?.audit_logs ? (
            <div className="flex-col gap-6">
              <div>
                <h4 className="font-semibold text-sm mb-3 text-secondary uppercase">Audit Logs</h4>
                <div className="flex-col gap-3">
                  {result.audit_logs.map((log, i) => (
                    <div key={i} className="audit-log-item">
                      <div className="flex justify-between items-center mb-1">
                        <Badge variant="accent">{log.agent_name}</Badge>
                        <span className="text-xs text-secondary">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm">{log.decision}</p>
                      <div className="text-xs text-success mt-1">Confidence: {(log.confidence * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {result.timeline && result.timeline.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-secondary uppercase mt-4">Event Timeline</h4>
                  <div className="timeline-container">
                    {result.timeline.map((event, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <span className="text-xs text-accent">{event.event_type}</span>
                          <p className="text-sm">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-secondary p-4">AI Audit trail will appear here.</div>
          )}
        </Card>
      </div>
    </div>
  );
};

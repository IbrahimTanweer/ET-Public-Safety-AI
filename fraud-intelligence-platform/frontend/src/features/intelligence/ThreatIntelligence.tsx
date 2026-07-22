import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { CampaignData, ComplaintData } from '../../lib/api';
import { ShieldAlert, Activity, Crosshair, MapPin, ExternalLink, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ThreatIntelligence.css';

export const ThreatIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCampaigns().then(data => setCampaigns((data.ranked_campaigns || []).map((rc: any) => rc.campaign || rc))),
      api.getComplaints().then(data => setComplaints(data.complaints || []))
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="threat-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '5rem' }}>
        <Activity style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', color: '#ef4444', marginBottom: '1rem' }} size={48} />
        <p style={{ color: '#9ca3af' }}>Connecting to Threat Intelligence Feeds...</p>
      </div>
    );
  }

  // Generate Threat Actors from Campaigns
  const threatActors = campaigns.map((c, i) => ({
    id: `TA-${1000 + i}`,
    alias: c.name || c.campaign_id || `Unknown Threat Actor ${i}`,
    loss: c.estimated_loss || 0,
    cases: c.linked_complaints?.length || 1,
    risk: c.risk_score || 0,
    type: c.campaign_id?.startsWith('CAMP') ? 'Organized Syndicate' : 'Lone Actor'
  })).sort((a, b) => b.risk - a.risk);

  // Fallback if no campaigns
  if (threatActors.length === 0) {
    threatActors.push({
      id: 'TA-1024', alias: 'Operation Phantom', loss: 850000, cases: 4, risk: 92, type: 'Organized Syndicate'
    });
    threatActors.push({
      id: 'TA-1025', alias: 'Shadow Caller', loss: 120000, cases: 2, risk: 65, type: 'Lone Actor'
    });
  }

  // Generate Live Feed from Complaints
  let liveFeeds = complaints.map((c) => ({
    id: c.complaint_id,
    time: new Date(c.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    title: `New ${c.scam_type || 'Fraud'} Incident Detected`,
    desc: (c.text || 'No description provided').substring(0, 100) + '...',
    amount: c.amount || 0,
    entities: [c.phone, c.upi, c.website].filter(Boolean),
    riskLevel: (c.amount || 0) > 100000 ? 'high' : (c.amount || 0) > 50000 ? 'medium' : 'low'
  }));

  // Fallback if no complaints
  if (liveFeeds.length === 0) {
    liveFeeds = [
      { id: 'COMP-111', time: '10:45 AM', title: 'High-Value Impersonation Attack', desc: 'Victim received a call from someone claiming to be CBI...', amount: 250000, entities: ['9876543210', 'finance.verify@sbi'], riskLevel: 'high' },
      { id: 'COMP-112', time: '10:30 AM', title: 'Phishing Domain Registered', desc: 'New domain linked to previous KYC fraud campaigns detected.', amount: 45000, entities: ['update-kyc-now.com'], riskLevel: 'medium' },
      { id: 'COMP-113', time: '09:15 AM', title: 'Digital Arrest Attempt', desc: 'Victim threatened with fake arrest warrant over Skype.', amount: 12000, entities: ['skype_id_fake', '9988776655'], riskLevel: 'low' },
    ];
  }

  return (
    <div className="threat-container fade-in">
      <div className="threat-header">
        <div>
          <h1><ShieldAlert size={28} className="live-shield-icon" /> THREAT INTELLIGENCE CENTER</h1>
          <p>Real-time monitoring of organized syndicates and emerging threat vectors.</p>
        </div>
      </div>

      <div className="threat-grid">
        
        {/* Left Column: Threat Actors */}
        <div className="threat-card">
          <h2 className="threat-card-title"><Crosshair size={18} /> IDENTIFIED THREAT ACTORS</h2>
          <div className="threat-actor-list">
            {threatActors.map((ta, i) => (
              <div key={i} className="threat-actor-row" onClick={() => navigate(`/campaigns`)}>
                <div className="ta-info">
                  <h3>
                    {ta.risk >= 75 && <AlertTriangle size={14} color="#ef4444" />}
                    {ta.alias} 
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#27272a', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', color: '#a5b4fc', marginLeft: '0.5rem' }}>{ta.id}</span>
                  </h3>
                  <p>{ta.type} • Risk Score: {ta.risk.toFixed(1)}/100</p>
                </div>
                <div className="ta-stats">
                  <div className="loss">₹{ta.loss.toLocaleString()}</div>
                  <div className="cases">{ta.cases} Linked Cases</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Feed */}
        <div className="threat-card">
          <h2 className="threat-card-title"><Clock size={18} /> LIVE INCIDENT FEED</h2>
          <div className="live-feed-list">
            {liveFeeds.map((feed, i) => (
              <div key={i} className={`feed-item ${feed.riskLevel}`}>
                <div className="feed-time">{feed.time}</div>
                <div className="feed-content">
                  <div className="feed-content-title">{feed.title}</div>
                  <div className="feed-content-desc">{feed.desc}</div>
                  {feed.entities.length > 0 && (
                    <div className="feed-entities">
                      {feed.entities.map((ent: any, idx: number) => (
                        <div key={idx} className="feed-entity" onClick={(e) => { e.stopPropagation(); navigate(`/graph?q=${encodeURIComponent(ent)}`); }} style={{ cursor: 'pointer' }}>
                          {ent}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

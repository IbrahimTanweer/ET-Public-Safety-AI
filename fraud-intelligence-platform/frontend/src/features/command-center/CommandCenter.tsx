import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TrendingUp, FileText, Search, Play } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import './CommandCenter.css';

export const CommandCenter: React.FC = () => {
  const { isDemoMode, isIncidentResponse } = useOutletContext<{ isDemoMode: boolean, isIncidentResponse: boolean }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [feed, setFeed] = useState<{ timeline: any[], audit: any[] }>({ timeline: [], audit: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats().then(setStats).catch(console.error),
      api.getCampaigns().then(data => setCampaigns((data.ranked_campaigns || []).map((rc: any) => rc.campaign || rc))).catch(console.error),
      api.getFeed().then(setFeed).catch(console.error)
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="command-center fade-in">
      {/* Top Section: Threat Overview */}
      <div className="cc-header">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {isIncidentResponse ? 'Critical Threat Feed' : "Today's Intelligence"}
            {isDemoMode && <Badge variant="accent" className="ml-3">DEMO MODE ACTIVE</Badge>}
          </h1>
          <p className="text-secondary">Sentinel Intelligence Bureau is actively monitoring cyber fraud across 14 zones.</p>
        </div>
        <div className="quick-actions">
          <Button variant="primary" icon={<FileText />} onClick={() => navigate('/intake')}>Register New Case</Button>
          <Button variant="secondary" icon={<Search />} onClick={() => navigate('/graph')}>Search Entity</Button>
          <Button variant="danger" icon={<Play />} onClick={() => navigate('/campaigns')}>Review Priority Queue</Button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="stats-grid">
        <Card>
          <div className="stat-label">Total Cases</div>
          <div className="stat-value">{stats?.total_complaints || '...'} <span className="stat-trend text-warning"><TrendingUp size={16}/> +12%</span></div>
        </Card>
        <Card>
          <div className="stat-label">Reported Financial Loss</div>
          <div className="stat-value text-success">₹{(stats?.total_financial_loss || 0).toLocaleString()}</div>
        </Card>
        <Card>
          <div className="stat-label">Tracked Phone Numbers</div>
          <div className="stat-value">{stats?.distinct_tracked_entities?.phones || '...'}</div>
        </Card>
        <Card>
          <div className="stat-label">Tracked UPI IDs</div>
          <div className="stat-value">{stats?.distinct_tracked_entities?.upis || '...'}</div>
        </Card>
      </div>

      <div className="cc-main-grid">
        {/* Left Column: Priority Queue & AI Insights */}
        <div className="cc-col-left flex flex-col gap-6">
          <Card title="Investigation Queue">
            <div className="queue-list flex flex-col gap-4">
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <div className="animate-pulse">Loading Campaigns...</div>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-secondary text-sm p-4">No active campaigns found.</div>
              ) : (
                campaigns.slice(0, 5).map(camp => (
                  <div key={camp.campaign_id} className="queue-item">
                    <div className="queue-item-header justify-between flex">
                      <div className="queue-title font-medium text-lg">{camp.name || `Campaign #${camp.campaign_id}`}</div>
                      <Badge variant="critical">{camp.risk_score || 90}% Risk</Badge>
                    </div>
                    <div className="queue-details text-secondary text-sm mt-1">
                      {camp.total_victims} Linked Cases • ₹{(camp.estimated_loss || 0).toLocaleString()} Loss
                    </div>
                    <div className="queue-actions mt-3">
                      <Button variant="secondary" className="text-xs">Open Investigation</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
 
          <Card title="AI Intelligence Summary">
            <ul className="ai-summary-list">
              <li><Badge variant="accent" className="mr-2">DETECTED</Badge> {campaigns.length} active fraud campaigns mapped in the current threat window.</li>
              <li><Badge variant="warning" className="mr-2">LINKED</Badge> {stats?.total_complaints || 0} isolated incidents connected via reused communication channels.</li>
              <li><Badge variant="critical" className="mr-2">GROWING</Badge> "{campaigns.length > 0 ? campaigns[0].name : 'Digital Arrest'}" scheme shows rapid network expansion.</li>
            </ul>
          </Card>
        </div>
 
        {/* Right Column: Live Threat Feed & Recent Activity */}
        <div className="cc-col-right flex flex-col gap-6">
          <Card title="Live Threat Feed">
            <div className="threat-feed flex flex-col gap-4">
              {feed.audit && feed.audit.length > 0 ? feed.audit.slice(0, 4).map(log => (
                <div key={log.id} className="threat-item flex items-center gap-3">
                  <span className={`threat-indicator ${log.decision === 'HIGH_RISK' ? 'critical-dot' : 'warning-dot'}`}></span>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{log.decision}</span>
                    <span className="text-xs text-secondary">{log.agent_name} (Conf: {(log.confidence * 100).toFixed(0)}%)</span>
                  </div>
                  <span className="text-xs text-secondary ml-auto">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )) : (
                <div className="text-sm text-secondary">No recent threats.</div>
              )}
            </div>
          </Card>
 
          <Card title="Recent Activity">
            <div className="activity-feed flex flex-col gap-4 text-sm">
              {feed.timeline && feed.timeline.length > 0 ? feed.timeline.slice(0, 5).map(event => (
                <div key={event.id} className="activity-item flex justify-between gap-3 items-start">
                  <span className="flex-1"><strong className="text-accent">{event.event_type}</strong>: {event.description}</span>
                  <span className="text-secondary text-xs whitespace-nowrap flex-shrink-0 mt-1">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )) : (
                <div className="text-sm text-secondary">No recent activity.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

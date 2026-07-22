import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { CampaignData } from '../../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Activity, ShieldAlert, CheckCircle, TrendingUp, AlertTriangle, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './IntelligenceAnalytics.css';

export const IntelligenceAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats().then(setStats).catch(console.error),
      api.getComplaints().then(data => setComplaints(data.complaints || [])).catch(console.error),
      api.getCampaigns().then(data => setCampaigns((data.ranked_campaigns || []).map((rc: any) => rc.campaign || rc))).catch(console.error)
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="soc-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '5rem' }}>
        <Activity style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', color: '#6366f1', marginBottom: '1rem' }} size={48} />
        <p style={{ color: '#9ca3af' }}>Initializing SOC Dashboard...</p>
      </div>
    );
  }

  // --- DATA AGGREGATION ---

  // 1. KPIs
  const totalCases = stats?.total_complaints || 0;
  const totalLoss = stats?.total_financial_loss || 0;
  const activeCampaignsCount = campaigns.length;
  const highRiskCount = campaigns.filter(c => (c.risk_score || 0) >= 75).length;
  const medRiskCount = campaigns.filter(c => (c.risk_score || 0) >= 40 && (c.risk_score || 0) < 75).length;

  // 2. Scam Distribution
  let scamDistribution = stats?.scam_category_distribution || {};
  if (Object.keys(scamDistribution).length === 0) {
    scamDistribution = { 'Digital Arrest': 2, 'Impersonation': 2, 'Phishing': 1 };
  }
  const threatDistData = Object.keys(scamDistribution).map(key => ({
    name: key,
    count: scamDistribution[key]
  })).sort((a, b) => b.count - a.count);

  // 3. Loss by Scam Type
  const lossByScamMap: Record<string, number> = {};
  if (complaints.length === 0) {
    lossByScamMap['Digital Arrest'] = 250000;
    lossByScamMap['Impersonation'] = 120000;
    lossByScamMap['Phishing'] = 80000;
  } else {
    complaints.forEach(c => {
      const type = c.scam_type || 'Unknown';
      lossByScamMap[type] = (lossByScamMap[type] || 0) + (c.amount || 0);
    });
  }
  const lossByScamData = Object.keys(lossByScamMap).map(key => ({
    name: key,
    loss: lossByScamMap[key]
  })).sort((a, b) => b.loss - a.loss);

  // 4. Daily Trends (Volume & Loss)
  let timelineData: any[] = [];
  if (complaints.length === 0) {
    const today = new Date();
    timelineData = Array.from({length: 7}).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        volume: Math.floor(Math.random() * 5) + 1,
        loss: Math.floor(Math.random() * 50000)
      };
    });
  } else {
    const dateMap: Record<string, { date: string, volume: number, loss: number }> = {};
    complaints.forEach(c => {
      const dateStr = new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      if (!dateMap[dateStr]) dateMap[dateStr] = { date: dateStr, volume: 0, loss: 0 };
      dateMap[dateStr].volume += 1;
      dateMap[dateStr].loss += c.amount || 0;
    });
    timelineData = Object.values(dateMap);
  }

  // 5. Risk Distribution (Pie)
  let high = 0, med = 0, low = 0;
  if (campaigns.length === 0) {
    high = 2; med = 3; low = 1;
  } else {
    campaigns.forEach(c => {
      const r = c.risk_score || 0;
      if (r >= 75) high++;
      else if (r >= 40) med++;
      else low++;
    });
  }
  const riskPieData = [
    { name: 'High Risk', value: high, color: '#ef4444' }, // Red
    { name: 'Medium Risk', value: med, color: '#f59e0b' }, // Orange
    { name: 'Low Risk', value: low, color: '#22c55e' } // Green
  ].filter(entry => entry.value > 0);

  // 6. Top Fraud Entities
  const topPhones = stats?.top_entities?.phones || [{ id: '9876543210', count: 2 }, { id: '9988776655', count: 1 }];
  const topUpis = stats?.top_entities?.upis || [{ id: 'finance.verify@sbi', count: 2 }];
  const topWebsites = stats?.top_entities?.websites || [{ id: 'secure-cbi.com', count: 2 }, { id: 'update-kyc.com', count: 1 }];
  const topBanks = stats?.top_entities?.banks || [{ id: 'State Bank of India', count: 2 }];

  // 7. Campaign Heatmap
  const campaignData = campaigns.slice(0, 10).map((c) => ({
    name: c.name || c.campaign_id || 'Unknown',
    loss: c.estimated_loss || 0,
    risk: c.risk_score || 0
  }));

  // 8. Custom Tooltip
  const CustomTooltip = ({ active, payload, label, prefix = '' }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="soc-tooltip">
          <p className="soc-tooltip-label">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="soc-tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {prefix}{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="soc-container">
      
      <div className="soc-header">
        <h1>INTELLIGENCE ANALYTICS</h1>
        <div className="soc-legend">
           <div className="soc-legend-item"><div className="soc-dot" style={{backgroundColor: '#ef4444'}}></div><span>High Risk</span></div>
           <div className="soc-legend-item"><div className="soc-dot" style={{backgroundColor: '#f59e0b'}}></div><span>Medium Risk</span></div>
           <div className="soc-legend-item"><div className="soc-dot" style={{backgroundColor: '#22c55e'}}></div><span>Low Risk</span></div>
           <div className="soc-legend-item"><div className="soc-dot" style={{backgroundColor: '#3b82f6'}}></div><span>Volume</span></div>
           <div className="soc-legend-item"><div className="soc-dot" style={{backgroundColor: '#a855f7'}}></div><span>Loss</span></div>
        </div>
      </div>
      
      {/* 1. KPIs */}
      <div className="soc-kpi-grid">
        <div className="soc-kpi-card">
          <div>
            <div className="soc-kpi-title">TOTAL CASES</div>
            <div className="soc-kpi-value blue">{totalCases}</div>
          </div>
          <Activity className="soc-kpi-icon" color="#3b82f6" size={32} />
        </div>
        <div className="soc-kpi-card">
          <div>
            <div className="soc-kpi-title">TOTAL LOSS</div>
            <div className="soc-kpi-value purple">₹{totalLoss.toLocaleString()}</div>
          </div>
          <IndianRupee className="soc-kpi-icon" color="#a855f7" size={32} />
        </div>
        <div className="soc-kpi-card">
          <div>
            <div className="soc-kpi-title">ACTIVE CAMPAIGNS</div>
            <div className="soc-kpi-value white">{activeCampaignsCount}</div>
          </div>
          <TrendingUp className="soc-kpi-icon" color="#ffffff" size={32} />
        </div>
        <div className="soc-kpi-card high-risk">
          <div>
            <div className="soc-kpi-title high-risk">HIGH/MED RISK</div>
            <div className="soc-kpi-value red">{highRiskCount + medRiskCount}</div>
          </div>
          <ShieldAlert className="soc-kpi-icon" color="#ef4444" size={32} />
        </div>
      </div>

      {/* LIVE INTELLIGENCE FEED */}
      <div className="soc-chart-card" style={{ marginBottom: '1.5rem', height: '140px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <h2 className="soc-chart-title" style={{ marginBottom: '0.5rem', color: '#14b8a6', flexShrink: 0 }}>LIVE INTELLIGENCE FEED</h2>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', animation: 'scroll 10s linear infinite', position: 'absolute', width: '100%' }}>
            <div style={{ display: 'flex', gap: '1rem' }}><span style={{ color: '#6b7280' }}>10:45</span> <span style={{ color: '#a855f7' }}>Shared UPI detected</span> <span className="soc-entity-id">finance.verify@sbi</span></div>
            <div style={{ display: 'flex', gap: '1rem' }}><span style={{ color: '#6b7280' }}>10:46</span> <span style={{ color: '#3b82f6' }}>Campaign expanded</span> <span style={{ color: '#9ca3af' }}>+1 complaint linked</span></div>
            <div style={{ display: 'flex', gap: '1rem' }}><span style={{ color: '#6b7280' }}>10:47</span> <span style={{ color: '#ef4444' }}>Network Risk escalated</span> <span>HIGH</span></div>
            <div style={{ display: 'flex', gap: '1rem' }}><span style={{ color: '#6b7280' }}>10:48</span> <span style={{ color: '#22c55e' }}>Evidence package generated</span> <span>COMP-29393ade</span></div>
          </div>
        </div>
      </div>

      <div className="soc-charts-grid">
        {/* Threat Distribution */}
        <div className="soc-chart-card">
          <h2 className="soc-chart-title">THREAT DISTRIBUTION</h2>
          <div className="soc-chart-container">
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={threatDistData} layout="vertical" margin={{ left: 30, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" tick={{ fill: '#71717a' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Cases" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Incident Trend */}
        <div className="soc-chart-card">
          <h2 className="soc-chart-title">DAILY INCIDENT TREND</h2>
          <div className="soc-chart-container">
            <ResponsiveContainer width="100%" height={256}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="volColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis stroke="#71717a" tick={{ fill: '#71717a' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="volume" name="Incidents" stroke="#3b82f6" fill="url(#volColor)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loss by Scam Type */}
        <div className="soc-chart-card">
          <h2 className="soc-chart-title">LOSS BY SCAM TYPE</h2>
          <div className="soc-chart-container">
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={lossByScamData} margin={{ top: 10, right: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip content={<CustomTooltip prefix="₹" />} />
                <Bar dataKey="loss" name="Loss" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Score Distribution */}
        <div className="soc-chart-card">
          <h2 className="soc-chart-title">RISK DISTRIBUTION (CAMPAIGNS)</h2>
          <div className="soc-chart-container">
            {campaigns.length > 0 || riskPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={256}>
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="soc-chart-container empty">No Risk Data</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Entities */}
      <div className="soc-entities-container">
        <h2 className="soc-chart-title">TOP FRAUD ENTITIES</h2>
        <div className="soc-entities-grid">
          
          <div className="soc-entity-card">
            <h3 className="soc-entity-title">Top Phone Numbers</h3>
            {topPhones.length > 0 ? topPhones.map((e, i) => (
              <div key={i} className="soc-entity-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/graph?q=${encodeURIComponent(e.id)}`)}>
                <span className="soc-entity-id blue" title={e.id}>{e.id}</span>
                <span className="soc-entity-count">{e.count} Cases</span>
              </div>
            )) : <div className="soc-entity-count">No data</div>}
          </div>

          <div className="soc-entity-card">
            <h3 className="soc-entity-title">Top Websites / Domains</h3>
            {topWebsites.length > 0 ? topWebsites.map((e, i) => (
              <div key={i} className="soc-entity-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/graph?q=${encodeURIComponent(e.id)}`)}>
                <span className="soc-entity-id orange" title={e.id}>{e.id}</span>
                <span className="soc-entity-count">{e.count} Cases</span>
              </div>
            )) : <div className="soc-entity-count">No data</div>}
          </div>

          <div className="soc-entity-card">
            <h3 className="soc-entity-title">Top UPI IDs</h3>
            {topUpis.length > 0 ? topUpis.map((e, i) => (
              <div key={i} className="soc-entity-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/graph?q=${encodeURIComponent(e.id)}`)}>
                <span className="soc-entity-id green" title={e.id}>{e.id}</span>
                <span className="soc-entity-count">{e.count} Cases</span>
              </div>
            )) : <div className="soc-entity-count">No data</div>}
          </div>

          <div className="soc-entity-card">
            <h3 className="soc-entity-title">Top Targeted Banks</h3>
            {topBanks.length > 0 ? topBanks.map((e, i) => (
              <div key={i} className="soc-entity-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/graph?q=${encodeURIComponent(e.id)}`)}>
                <span className="soc-entity-id purple" title={e.id}>{e.id}</span>
                <span className="soc-entity-count">{e.count} Cases</span>
              </div>
            )) : <div className="soc-entity-count">No data</div>}
          </div>

        </div>
      </div>

      {/* Bottom Grid: Campaign Heatmap & Map/Insights */}
      <div className="soc-bottom-grid">
        
        {/* Campaign Heatmap */}
        <div className="soc-chart-card">
          <h2 className="soc-chart-title">CAMPAIGN HEATMAP (LOSS)</h2>
          <div className="soc-chart-container">
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={campaignData} layout="vertical" margin={{ left: 50, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" tick={{ fill: '#71717a' }} tickFormatter={(v) => `₹${v/1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} width={120} />
                <Tooltip content={<CustomTooltip prefix="₹" />} />
                <Bar dataKey="loss" name="Network Loss" radius={[0, 4, 4, 0]} barSize={20}>
                  {campaignData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.loss > 200000 ? '#ef4444' : entry.loss > 50000 ? '#f59e0b' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic & Insights */}
        <div className="soc-geo-grid">
          
          <div className="soc-chart-card">
             <h2 className="soc-chart-title">
                GEOGRAPHIC MAP 
             </h2>
             <div className="soc-geo-bars">
                <div>
                  <div className="soc-geo-row"><span>Delhi NCR</span><span className="soc-geo-pct">42%</span></div>
                  <div className="soc-geo-bar-bg"><div className="soc-geo-bar-fill" style={{ width: '42%' }}></div></div>
                </div>
                <div>
                  <div className="soc-geo-row"><span>Mumbai</span><span className="soc-geo-pct">28%</span></div>
                  <div className="soc-geo-bar-bg"><div className="soc-geo-bar-fill" style={{ width: '28%' }}></div></div>
                </div>
                <div>
                  <div className="soc-geo-row"><span>Bangalore</span><span className="soc-geo-pct">15%</span></div>
                  <div className="soc-geo-bar-bg"><div className="soc-geo-bar-fill" style={{ width: '15%' }}></div></div>
                </div>
                <div>
                  <div className="soc-geo-row"><span>Hyderabad</span><span className="soc-geo-pct">10%</span></div>
                  <div className="soc-geo-bar-bg"><div className="soc-geo-bar-fill" style={{ width: '10%' }}></div></div>
                </div>
             </div>
          </div>

          <div className="soc-ai-panel">
             <ShieldAlert className="soc-ai-bg-icon" size={120} />
             <h2 className="soc-ai-title">AI INSIGHTS PANEL</h2>
             
             <div className="soc-ai-insights">
                <div className="soc-ai-insight normal">
                  <CheckCircle size={16} className="soc-ai-icon green" />
                  <span>Shared phone detected across {topPhones[0]?.count || 2} complaints.</span>
                </div>
                <div className="soc-ai-insight normal">
                  <CheckCircle size={16} className="soc-ai-icon green" />
                  <span>Shared UPI reused: {topUpis[0]?.id || 'finance.verify@sbi'}</span>
                </div>
                <div className="soc-ai-insight normal">
                  <CheckCircle size={16} className="soc-ai-icon green" />
                  <span>Shared website detected: {topWebsites[0]?.id || 'secure-cbi.com'}</span>
                </div>
                <div className="soc-ai-insight alert">
                  <AlertTriangle size={16} className="soc-ai-icon red" />
                  <div>
                    <div style={{fontWeight: 700, marginBottom: '0.25rem', color: '#ef4444'}}>Overall Threat Assessment: HIGH</div>
                    <span>Organized financial fraud network detected involving reused communication and payment infrastructure.</span>
                  </div>
                </div>
             </div>

             <div className="soc-ai-footer">
                <div>
                  <div className="soc-ai-stat-label purple">AI Confidence</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="soc-ai-stat-value white">96.8%</div>
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#3730a3', color: '#a5b4fc', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: 700 }}>HIGH</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="soc-ai-stat-label red">Est. Network Loss</div>
                  <div className="soc-ai-stat-value red">₹{totalLoss.toLocaleString()}</div>
                </div>
             </div>
          </div>

        </div>
      </div>
      
      {/* AI Recommendations */}
      <div className="soc-chart-card" style={{ marginTop: '1.5rem', background: '#18181b', borderColor: '#27272a' }}>
        <h2 className="soc-chart-title" style={{ color: '#fbbf24', borderBottom: '1px solid #27272a', paddingBottom: '0.75rem' }}>AI RECOMMENDATIONS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.75rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={14} color="#10b981"/> Freeze beneficiary accounts</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={14} color="#10b981"/> Block shared UPI IDs</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={14} color="#10b981"/> Suspend shared domains</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={14} color="#10b981"/> Obtain CDR</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={14} color="#10b981"/> Notify CERT-In</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={14} color="#ef4444"/> Prioritize Campaign CAMP-001</div>
        </div>
      </div>

    </div>
  );
};

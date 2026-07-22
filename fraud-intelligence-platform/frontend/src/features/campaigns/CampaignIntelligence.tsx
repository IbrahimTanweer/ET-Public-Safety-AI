import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';
import type { CampaignData } from '../../lib/api';
import { Target, Activity, FileText } from 'lucide-react';
import './CampaignIntelligence.css';

export const CampaignIntelligence: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await api.getCampaigns();
      setCampaigns((data.ranked_campaigns || []).map((rc: any) => rc.campaign || rc));
    } catch (e) {
      console.error(e);
      // fallback mock if backend not reachable
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async (id: string) => {
    setSummarizing(id);
    try {
      const data = await api.summarizeCampaign(id);
      setSummaryData(prev => ({ ...prev, [id]: data.ai_summary }));
    } catch (e) {
      console.error(e);
      alert('Failed to generate summary.');
    } finally {
      setSummarizing(null);
    }
  };

  return (
    <div className="campaign-intelligence fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaign Intelligence</h1>
        <Button onClick={fetchCampaigns} icon={<Activity />} disabled={loading}>Refresh Campaigns</Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12 text-secondary">Loading Campaigns...</div>
      ) : (
        <div className="flex-col gap-6">
          {campaigns.map((camp, i) => (
            <Card key={i} title={`Fraud Campaign: ${camp.campaign_id}`}>
              <div className="flex justify-between items-start">
                <div className="flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <Badge variant="critical">High Priority</Badge>
                    <span className="text-sm text-secondary">Risk Score: {(camp.risk_score || 0).toFixed(2)}</span>
                  </div>
                  <div className="text-sm mt-2">
                    <strong>Linked Cases: </strong> 
                    {(camp.linked_complaints || camp.complaints || []).map((c: string) => <Badge key={c} variant="default" className="mr-1">{c}</Badge>)}
                  </div>
                  
                  {summaryData[camp.campaign_id!] && (
                    <div className="campaign-summary-box">
                      <h4 className="font-semibold mb-2 text-accent flex items-center gap-2"><Target size={16}/> AI Summary</h4>
                      {summaryData[camp.campaign_id!]}
                    </div>
                  )}
                </div>
                
                <div>
                  <Button 
                    variant="secondary" 
                    icon={<FileText />}
                    disabled={summarizing === camp.campaign_id}
                    onClick={() => handleSummarize(camp.campaign_id!)}
                  >
                    {summarizing === camp.campaign_id ? 'Generating...' : 'Generate AI Summary'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {campaigns.length === 0 && !loading && (
            <div className="text-secondary p-4 text-center border border-dashed border-border rounded-lg">
              No active campaigns detected.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

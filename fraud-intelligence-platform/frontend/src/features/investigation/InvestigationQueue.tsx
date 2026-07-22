import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { Activity } from 'lucide-react';

export const InvestigationQueue: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getComplaints().then(data => {
      setComplaints(data.complaints || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="fade-in p-6">
      <h1 className="text-2xl font-bold mb-6">Investigation Queue</h1>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Activity style={{ animation: 'pulse 2s infinite' }} />
        </div>
      ) : complaints.length === 0 ? (
        <Card><div className="p-4">No active investigations in queue.</div></Card>
      ) : (
        <div className="flex flex-col gap-4">
          {complaints.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div style={{ maxWidth: '75%' }}>
                  <div className="font-bold text-lg mb-1">{c.id}</div>
                  <div className="text-sm text-secondary mb-2">{new Date(c.created_at).toLocaleString()}</div>
                  <div className="text-sm">{c.text?.substring(0, 150)}{c.text?.length > 150 ? '...' : ''}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="critical">₹{(c.amount || 0).toLocaleString()}</Badge>
                  <Badge variant="accent">{c.scam_type || 'Unknown'}</Badge>
                  <Button variant="secondary" className="mt-2 text-xs">Open Investigation</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

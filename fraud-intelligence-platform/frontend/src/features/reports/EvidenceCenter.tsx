import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { FileText, Download, Activity } from 'lucide-react';
import './EvidenceCenter.css';

export const EvidenceCenter: React.FC = () => {
  const [complaintId, setComplaintId] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintId.trim()) return;
    
    setLoading(true);
    setReport(null);
    try {
      const data = await api.generateReport(complaintId);
      setReport(data.report);
    } catch (err) {
      console.error(err);
      alert('Failed to generate evidence report.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderReport = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="report-h3">{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="report-h1">{line.replace('# ', '')}</h1>);
      } else if (line.startsWith('**') && line.includes(':**')) {
        const parts = line.split(':**');
        elements.push(
          <div key={i} className="report-kv">
            <span className="report-key">{parts[0].replace('**', '')}:</span>
            <span className="report-value">{parts[1]}</span>
          </div>
        );
      } else if (line.startsWith('* ')) {
        const content = line.substring(2);
        const parts = content.split('**');
        const formatted = parts.map((part, index) => index % 2 === 1 ? <strong key={index}>{part}</strong> : part);
        elements.push(<li key={i} className="report-li">{formatted}</li>);
      } else if (line === '---') {
        elements.push(<hr key={i} className="report-hr" />);
      } else if (line.trim() === '') {
        elements.push(<div key={i} style={{ height: '12px' }}></div>);
      } else {
        const parts = line.split('**');
        const formatted = parts.map((part, index) => index % 2 === 1 ? <strong key={index}>{part}</strong> : part);
        elements.push(<p key={i} className="report-p">{formatted}</p>);
      }
    });
    return <div className="report-content">{elements}</div>;
  };

  return (
    <div className="evidence-center fade-in">
      <h1 className="text-2xl font-bold">Evidence Center</h1>
      
      <Card className="no-print">
        <form onSubmit={handleGenerate} className="flex gap-4 items-end">
          <div className="flex-col flex-1">
            <label className="text-sm font-semibold text-secondary mb-2 block">Enter Case/Complaint ID</label>
            <input 
              type="text" 
              className="evidence-input w-full"
              value={complaintId}
              onChange={e => setComplaintId(e.target.value)}
              placeholder="e.g. COMP-1234abcd"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading || !complaintId.trim()} icon={<FileText />}>
            {loading ? 'Compiling Package...' : 'Generate Evidence Package'}
          </Button>
        </form>
      </Card>

      {loading && (
        <Card className="no-print">
          <div className="p-12 flex flex-col items-center justify-center text-secondary gap-4">
            <Activity className="animate-pulse text-accent" size={48} />
            <p>AI is generating the official investigation report...</p>
          </div>
        </Card>
      )}

      {report && (
        <Card title={`Evidence Package: ${complaintId}`}>
          <div className="flex justify-end mb-4 no-print">
            <Button variant="secondary" icon={<Download />} onClick={handlePrint}>Export PDF</Button>
          </div>
          
          <div className="print-header hidden">
            <div className="print-seal-container">
              <img src="/sib-badge.png" alt="SIB Logo" className="print-logo" />
            </div>
            <div className="print-logo-text">SENTINEL INTELLIGENCE BUREAU</div>
            <div className="print-sub">DEPARTMENT OF JUSTICE - FEDERAL INVESTIGATIONS</div>
            <div className="print-classification">CLASSIFICATION: TOP SECRET // NOFORN</div>
          </div>
          
          <div className="evidence-text-area">
             {renderReport(report)}
          </div>
          
          <div className="print-footer hidden">
             <div>PAGE 1 OF 1</div>
             <div>UNAUTHORIZED REPRODUCTION PROHIBITED</div>
          </div>
        </Card>
      )}
    </div>
  );
};

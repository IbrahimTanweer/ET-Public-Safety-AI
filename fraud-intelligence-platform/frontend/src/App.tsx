import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';

// Feature Pages
import { CommandCenter } from './features/command-center/CommandCenter';
import { InvestigationQueue } from './features/investigation/InvestigationQueue';
import { CaseIntake } from './features/complaints/CaseIntake';
import { KnowledgeGraph } from './features/graph/KnowledgeGraph';
import { CampaignIntelligence } from './features/campaigns/CampaignIntelligence';
import { ThreatIntelligence } from './features/intelligence/ThreatIntelligence';
import { EvidenceCenter } from './features/reports/EvidenceCenter';
import { IntelligenceAnalytics } from './features/analytics/IntelligenceAnalytics';
import { AdminSettings } from './features/admin/AdminSettings';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<CommandCenter />} />
          <Route path="queue" element={<InvestigationQueue />} />
          <Route path="intake" element={<CaseIntake />} />
          <Route path="graph" element={<KnowledgeGraph />} />
          <Route path="campaigns" element={<CampaignIntelligence />} />
          <Route path="threats" element={<ThreatIntelligence />} />
          <Route path="evidence" element={<EvidenceCenter />} />
          <Route path="analytics" element={<IntelligenceAnalytics />} />
          <Route path="admin" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

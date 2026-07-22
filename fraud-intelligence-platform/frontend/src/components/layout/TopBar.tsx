import React, { useState, useEffect } from 'react';
import { Search, Bell, PlayCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import './TopBar.css';

interface TopBarProps {
  onToggleDemoMode: () => void;
  isDemoMode: boolean;
  onToggleIncidentResponse: () => void;
  isIncidentResponse: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onToggleDemoMode, 
  isDemoMode,
  onToggleIncidentResponse,
  isIncidentResponse
}) => {
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-search">
        <div 
          className="search-mock"
          onClick={() => setShowSearch(true)}
        >
          <Search size={18} className="text-secondary" />
          <span className="search-placeholder">Global Search (Ctrl + K)</span>
        </div>
      </div>
      
      <div className="topbar-actions">
        {/* Hackathon Demo Mode Toggle */}
        <button 
          className={`demo-toggle ${isDemoMode ? 'active' : ''}`}
          onClick={onToggleDemoMode}
          title="Toggle Demo Mode"
        >
          <PlayCircle size={18} />
          <span>Demo Mode</span>
        </button>

        {/* Incident Response Toggle */}
        <button 
          className={`ir-toggle ${isIncidentResponse ? 'active' : ''}`}
          onClick={onToggleIncidentResponse}
          title="Toggle Incident Response Mode"
        >
          <AlertTriangle size={18} />
          <span>IR Mode</span>
        </button>

        <div className="threat-level">
          <span className="threat-label">Threat Level:</span>
          <Badge variant={isIncidentResponse ? 'critical' : 'warning'}>
            {isIncidentResponse ? 'CRITICAL' : 'HIGH'}
          </Badge>
        </div>

        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
      </div>

      {showSearch && (
        <div className="search-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="search-modal-header">
              <Search size={20} className="text-secondary" />
              <input 
                type="text" 
                placeholder="Search Phone, UPI, Complaint, Campaign, Victim..." 
                autoFocus 
              />
              <span className="esc-hint">ESC</span>
            </div>
            <div className="search-results">
              <div className="search-section-title">Recent Searches</div>
              <div className="search-result-item">
                <span className="text-accent">Phone:</span> +91 98765 43210
              </div>
              <div className="search-result-item">
                <span className="text-critical">Campaign:</span> Digital Arrest Scheme
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

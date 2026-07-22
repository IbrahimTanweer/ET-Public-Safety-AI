import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  Inbox, 
  Network, 
  Target, 
  ShieldAlert, 
  FolderLock, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Command Center', icon: <Home size={18} /> },
  { path: '/queue', label: 'Investigation Queue', icon: <FolderOpen size={18} /> },
  { path: '/intake', label: 'Case Intake', icon: <Inbox size={18} /> },
  { path: '/graph', label: 'Knowledge Graph', icon: <Network size={18} /> },
  { path: '/campaigns', label: 'Campaign Intelligence', icon: <Target size={18} /> },
  { path: '/threats', label: 'Threat Intelligence Center', icon: <ShieldAlert size={18} /> },
  { path: '/evidence', label: 'Evidence Center', icon: <FolderLock size={18} /> },
  { path: '/analytics', label: 'Intelligence Analytics', icon: <BarChart3 size={18} /> },
  { path: '/admin', label: 'Administration & Audit', icon: <Settings size={18} /> },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge-container">
          <img src="/sib-badge.png" alt="SIB Badge" className="logo-badge" />
          <div className="logo-title-block">
            <span className="logo-agency">SENTINEL</span>
            <span className="logo-division">Intelligence Bureau</span>
          </div>
        </div>
        <div className="logo-separator"></div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="officer-profile">
          <div className="avatar">RS</div>
          <div className="officer-info">
            <span className="officer-name">Rahul Sharma</span>
            <span className="officer-role">Senior Investigator</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

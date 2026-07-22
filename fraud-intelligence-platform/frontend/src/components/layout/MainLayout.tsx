import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  Inbox, 
  Network, 
  Target, 
  ShieldAlert, 
  FolderLock, 
  BarChart3, 
  Settings,
  Search,
  Menu,
  X,
  Mail
} from 'lucide-react';
import './MainLayout.css';

const navItems = [
  { path: '/', label: 'Home / Command Center', icon: <Home size={18} /> },
  { path: '/queue', label: 'Investigation Queue', icon: <FolderOpen size={18} /> },
  { path: '/intake', label: 'Case Intake', icon: <Inbox size={18} /> },
  { path: '/graph', label: 'Knowledge Graph', icon: <Network size={18} /> },
  { path: '/campaigns', label: 'Campaign Intelligence', icon: <Target size={18} /> },
  { path: '/threats', label: 'Threat Center', icon: <ShieldAlert size={18} /> },
  { path: '/evidence', label: 'Evidence Center', icon: <FolderLock size={18} /> },
  { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { path: '/admin', label: 'Admin & Audit', icon: <Settings size={18} /> },
];

export const MainLayout: React.FC = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isIncidentResponse, setIsIncidentResponse] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/graph?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowDrawer(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`fbi-app-container ${isIncidentResponse ? 'incident-response-mode' : ''}`}>
      
      {/* 1. Left-side Sliding Menu Drawer (FBI Style) */}
      <div className={`fbi-drawer-overlay ${showDrawer ? 'show' : ''}`} onClick={() => setShowDrawer(false)}>
        <div className="fbi-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h2>Menu</h2>
            <button className="close-btn" onClick={() => setShowDrawer(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="drawer-search">
            <div className="drawer-search-input">
              <input 
                type="text" 
                placeholder="Search SIB Database..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            <button className="drawer-search-btn" onClick={() => handleSearch({ key: 'Enter' } as any)}>
              <Search size={14} className="mr-1" /> Search SIB
            </button>
          </div>

          <div className="drawer-socials">
            {/* Social media icons */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <Mail size={18} />
          </div>

          <nav className="drawer-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setShowDrawer(false)}
              >
                <span className="drawer-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* 2. Main Centered Header Banner */}
      <header className="fbi-main-header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setShowDrawer(true)}>
            <Menu size={20} />
            <span>MENU</span>
          </button>
        </div>

        <div className="header-center">
          <div className="fbi-logo-block">
            <img src="/sib-badge.png" alt="Sentinel Intelligence Bureau" className="fbi-logo-img" />
            <div className="fbi-title-text">
              <span className="fbi-title-main">SENTINEL INTELLIGENCE BUREAU</span>
              <span className="fbi-title-sub">DEPARTMENT OF JUSTICE • FEDERAL INVESTIGATIONS</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="fbi-search-bar">
            <input 
              type="text" 
              placeholder="Search SIB Database..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <Search size={16} className="search-icon" style={{ cursor: 'pointer' }} onClick={() => handleSearch({ key: 'Enter' } as any)} />
          </div>
          
          <div className="header-toggles">
            <button 
              className={`mode-toggle-btn ${isDemoMode ? 'active' : ''}`}
              onClick={() => setIsDemoMode(!isDemoMode)}
            >
              Demo Mode
            </button>
            <button 
              className={`mode-toggle-btn ir-btn ${isIncidentResponse ? 'active' : ''}`}
              onClick={() => setIsIncidentResponse(!isIncidentResponse)}
            >
              IR Mode
            </button>
          </div>
        </div>
      </header>

      {/* 3. Page Content area */}
      <main className="fbi-page-wrapper">
        <div className="fbi-page-container">
          <Outlet context={{ isDemoMode, isIncidentResponse }} />
        </div>
      </main>

      {/* 4. SIB Style Enhanced Footer (Emulating fbi.gov footer layout) */}
      <footer className="fbi-footer">
        <div className="fbi-footer-grid">
          
          {/* Column 1: Most Wanted */}
          <div className="footer-column">
            <h3>Most Wanted</h3>
            <ul>
              <li><NavLink to="/">Command Center</NavLink></li>
              <li><NavLink to="/campaigns">Campaign Intelligence</NavLink></li>
              <li><NavLink to="/threats">Threat Center</NavLink></li>
              <li><a href="#fugitives">Fugitives</a></li>
              <li><a href="#terrorism">Terrorism</a></li>
              <li><a href="#missing">Seeking Information</a></li>
            </ul>
          </div>

          {/* Column 2: News & Reports */}
          <div className="footer-column">
            <h3>News & Analytics</h3>
            <ul>
              <li><NavLink to="/analytics">Analytics & Charts</NavLink></li>
              <li><a href="#stories">Stories</a></li>
              <li><a href="#videos">Videos & Briefings</a></li>
              <li><a href="#press">Press Releases</a></li>
              <li><a href="#speeches">Speeches & Testimony</a></li>
              <li><a href="#podcasts">Podcasts</a></li>
            </ul>
          </div>

          {/* Column 3: What We Investigate */}
          <div className="footer-column">
            <h3>What We Investigate</h3>
            <ul>
              <li><a href="#cyber">Cyber Crime</a></li>
              <li><a href="#identity">Identity Theft</a></li>
              <li><a href="#corruption">Public Corruption</a></li>
              <li><a href="#civil">Civil Rights</a></li>
              <li><a href="#organized">Organized Crime</a></li>
              <li><a href="#financial">White-Collar Crime</a></li>
              <li><a href="#violent">Violent Crime</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Us & Additional Resources */}
          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul>
              <li><NavLink to="/intake">Submit a Tip / Case Intake</NavLink></li>
              <li><a href="#offices">Field Offices</a></li>
              <li><a href="#hq">SIB Headquarters</a></li>
              <li><a href="#overseas">Overseas Offices</a></li>
            </ul>

            <h3 className="sub-header">Additional Resources</h3>
            <ul>
              <li><NavLink to="/evidence">Evidence Center</NavLink></li>
              <li><NavLink to="/admin">Administration & Audit</NavLink></li>
              <li><a href="#accessibility">Accessibility</a></li>
              <li><a href="#foia">Freedom of Information Act</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Logo, Socials and Top Secret Clearance info */}
        <div className="fbi-footer-bottom">
          <div className="footer-bottom-left">
            <img src="/sib-badge.png" alt="SIB Seal" className="footer-seal-small" />
            <div className="footer-seal-text">
              <span className="footer-agency">SENTINEL INTELLIGENCE BUREAU</span>
              <span className="footer-division">DEPARTMENT OF JUSTICE • TOP SECRET CLEARANCE REQUIRED</span>
            </div>
          </div>

          <div className="footer-bottom-right">
            <div className="footer-socials-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <Mail size={18} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, Users, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  
  const navStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '250px',
    height: '100vh',
    position: 'sticky' as const,
    top: 0,
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--glass-border)',
    padding: '2rem 1rem'
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    marginBottom: '0.5rem',
    transition: 'var(--transition)'
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <div style={navStyle}>
      <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
        <h2 style={{ 
          background: 'var(--accent-gradient)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>FinanceHub</h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Logged in as <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{user?.email}</span>
          <div style={{ marginTop: '0.25rem' }}>
            <span className={`badge badge-${user?.role.toLowerCase()}`}>{user?.role}</span>
          </div>
        </div>
      </div>

      <style>
        {`
          .nav-link:hover {
            background: rgba(255,255,255,0.05);
            color: var(--text-primary) !important;
          }
          .nav-link.active {
            background: rgba(0, 242, 254, 0.1);
            color: var(--accent-primary) !important;
            border-right: 3px solid var(--accent-primary);
          }
        `}
      </style>

      <div style={{ flex: 1 }}>
        <NavLink to="/dashboard" className={navLinkClass} style={linkStyle}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        
        {(user?.role === 'Admin' || user?.role === 'Analyst') && (
          <NavLink to="/records" className={navLinkClass} style={linkStyle}>
            <Wallet size={20} />
            Records
          </NavLink>
        )}
        
        {user?.role === 'Admin' && (
          <NavLink to="/users" className={navLinkClass} style={linkStyle}>
            <Users size={20} />
            Users Management
          </NavLink>
        )}
      </div>

      <button 
        onClick={logout} 
        style={{...linkStyle, background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', color: 'var(--danger)'}}
      >
        <LogOut size={20} />
        Log Out
      </button>
    </div>
  );
};

export default Sidebar;

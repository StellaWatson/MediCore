import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ title, children }) => {
  const { user } = useAuth();
  const roleColor = { administrator: '#ede7f6', clinician: '#e3f2fd', receptionist: '#f3e5f5' };
  const roleText = { administrator: '#4527a0', clinician: '#1565c0', receptionist: '#6a1b9a' };

  return (
    <div className="mrms-layout">
      <Sidebar />
      <div className="mrms-main">
        <header className="topbar">
          <h1 className="topbar-title">{title}</h1>
          <div className="topbar-actions">
            <span style={{ fontSize: 12, background: roleColor[user?.role] || '#eee', color: roleText[user?.role] || '#333', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
            <span style={{ fontSize: 13, color: '#718096' }}>{user?.name}</span>
          </div>
        </header>
        <main className="mrms-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

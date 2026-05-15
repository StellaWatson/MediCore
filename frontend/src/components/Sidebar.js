import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h6>MediCore Solutions</h6>
        <h5>🏥 CareTrack Clinic</h5>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Main</div>
        <NavLink to="/dashboard" className={({ isActive }) => 'nav-link-item' + (isActive ? ' active' : '')}>
          📊 Dashboard
        </NavLink>

        {/* Doctors - all roles can view */}
        <NavLink to="/doctors" className={({ isActive }) => 'nav-link-item' + (isActive ? ' active' : '')}>
          👨‍⚕️ Doctors
        </NavLink>

        {/* Patients - all roles */}
        <NavLink to="/patients" className={({ isActive }) => 'nav-link-item' + (isActive ? ' active' : '')}>
          🧑‍🤝‍🧑 Patients
        </NavLink>

        {/* Diseases - not receptionist */}
        {hasRole('administrator', 'clinician') && (
          <>
            <div className="nav-section-title">Clinical</div>
            <NavLink to="/diseases" className={({ isActive }) => 'nav-link-item' + (isActive ? ' active' : '')}>
              🩺 Diagnoses
            </NavLink>
          </>
        )}

        {/* Admin section */}
        {hasRole('administrator') && (
          <>
            <div className="nav-section-title">Admin</div>
            <NavLink to="/admin" className={({ isActive }) => 'nav-link-item' + (isActive ? ' active' : '')}>
              ⚙️ Admin Panel
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ marginTop: 10, width: '100%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px', cursor: 'pointer', fontSize: 12 }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

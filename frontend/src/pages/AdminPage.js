import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

const AdminPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  const roleInfo = [
    { role: 'Administrator', color: '#ede7f6', text: '#4527a0', icon: '⚙️', perms: ['Full access to all records', 'Create/edit/delete Doctors', 'Create/edit/delete Patients', 'Create/edit/delete Diagnoses', 'View Admin Panel', 'Manage system users'] },
    { role: 'Clinician', color: '#e3f2fd', text: '#1565c0', icon: '🩺', perms: ['View all Doctor profiles', 'View all Patient records', 'Update Patient records', 'Create/update Diagnoses', 'View Diagnosis history', 'No delete permissions'] },
    { role: 'Receptionist', color: '#f3e5f5', text: '#6a1b9a', icon: '🗂️', perms: ['View Doctor profiles', 'Register new Patients', 'View Patient records', 'No Diagnosis access', 'No delete permissions', 'No Admin Panel access'] },
  ];

  const demoAccounts = [
    { email: 'admin@caretrack.uz', role: 'administrator', name: 'Admin User' },
    { email: 'clinician@caretrack.uz', role: 'clinician', name: 'Dr. Nilufar Rashidova' },
    { email: 'receptionist@caretrack.uz', role: 'receptionist', name: 'Kamola Yusupova' },
  ];

  return (
    <Layout title="Admin Panel">
      {/* System overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active Doctors', value: stats?.totals.doctors ?? '—', icon: '👨‍⚕️', color: '#1a73e8', bg: '#e8f0fe' },
          { label: 'Registered Patients', value: stats?.totals.patients ?? '—', icon: '🧑‍🤝‍🧑', color: '#00897b', bg: '#e0f2f1' },
          { label: 'Diagnoses', value: stats?.totals.diagnoses ?? '—', icon: '🩺', color: '#f57c00', bg: '#fff3e0' },
          { label: 'Resolved Cases', value: stats?.diagnosisStatusBreakdown?.resolved ?? '—', icon: '✅', color: '#2e7d32', bg: '#e8f5e9' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 14, borderLeft: `4px solid ${color}` }}>
            <div style={{ width: 46, height: 46, background: bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Role Permissions Matrix */}
        <div className="ct-card" style={{ gridColumn: '1/-1' }}>
          <div className="ct-card-header"><span className="ct-card-title">🔐 Role-Based Access Control (RBAC)</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {roleInfo.map(({ role, color, text, icon, perms }) => (
              <div key={role} style={{ background: color, borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: text, marginBottom: 12 }}>{icon} {role}</div>
                {perms.map(p => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12, color: '#4a5568' }}>
                    <span style={{ color: '#2e7d32', fontWeight: 700 }}>✓</span> {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Demo Accounts */}
        <div className="ct-card">
          <div className="ct-card-header"><span className="ct-card-title">👤 System Accounts</span></div>
          <table className="ct-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>
              {demoAccounts.map(u => (
                <tr key={u.email}>
                  <td><strong>{u.name}</strong></td>
                  <td style={{ fontSize: 12, color: '#718096' }}>{u.email}</td>
                  <td><span className={`badge-role-${u.role}`}>{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff3e0', borderRadius: 8, fontSize: 12, color: '#e65100' }}>
            ⚠️ Demo password for all accounts: <strong>password</strong>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="ct-card">
          <div className="ct-card-header"><span className="ct-card-title">🛠️ Technology Stack</span></div>
          {[
            { layer: 'Frontend', tech: 'React.js 18, React Router 6, Axios', icon: '⚛️' },
            { layer: 'Styling', tech: 'Custom CSS, Inter font, Bootstrap 5 tokens', icon: '🎨' },
            { layer: 'Backend', tech: 'Node.js, Express.js 4', icon: '🟢' },
            { layer: 'Database', tech: 'Local JSON files (fs module)', icon: '📁' },
            { layer: 'Auth', tech: 'JWT tokens, bcrypt password hashing', icon: '🔐' },
            { layer: 'Architecture', tech: 'MVC pattern, RESTful API', icon: '🏗️' },
            { layer: 'Security', tech: 'RBAC middleware, CORS, env variables', icon: '🛡️' },
          ].map(({ layer, tech, icon }) => (
            <div key={layer} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
              <span>{icon}</span>
              <div>
                <span style={{ fontWeight: 700, color: '#1a202c' }}>{layer}: </span>
                <span style={{ color: '#718096' }}>{tech}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Relationships */}
      <div className="ct-card" style={{ marginTop: 20 }}>
        <div className="ct-card-header"><span className="ct-card-title">🔗 Data Model Relationships</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { from: 'Doctor', to: 'Patient', rel: 'One-to-Many', desc: 'One doctor can have many patients assigned', icon: '👨‍⚕️ → 🧑‍🤝‍🧑' },
            { from: 'Patient', to: 'Doctor', rel: 'Many-to-One', desc: 'Each patient is assigned to exactly one doctor', icon: '🧑‍🤝‍🧑 → 👨‍⚕️' },
            { from: 'Patient', to: 'Diagnosis', rel: 'One-to-Many', desc: 'One patient can have many diagnoses linked', icon: '🧑‍🤝‍🧑 → 🩺' },
          ].map(({ from, to, rel, desc, icon }) => (
            <div key={from + to} style={{ background: '#f8fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{from} → {to}</div>
              <div style={{ fontSize: 11, color: '#1a73e8', fontWeight: 600, marginBottom: 6 }}>{rel}</div>
              <div style={{ fontSize: 12, color: '#718096' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;

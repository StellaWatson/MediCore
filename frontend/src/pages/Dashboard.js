import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => { setStats(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><div style={{ textAlign: 'center', padding: 48 }}>Loading dashboard...</div></Layout>;

  // Format data for Recharts
  const severityData = [
    { name: 'Mild', value: stats?.severityBreakdown?.mild || 0, color: '#10b981' },
    { name: 'Moderate', value: stats?.severityBreakdown?.moderate || 0, color: '#f59e0b' },
    { name: 'Severe', value: stats?.severityBreakdown?.severe || 0, color: '#f43f5e' }
  ];

  const specialtyData = Object.entries(stats?.patientsBySpecialty || {}).map(([key, val]) => ({
    name: key,
    Patients: val
  }));

  const diagnosisStatusData = [
    { name: 'Ongoing', value: stats?.diagnosisStatusBreakdown?.ongoing || 0, color: '#3b82f6' },
    { name: 'Resolved', value: stats?.diagnosisStatusBreakdown?.resolved || 0, color: '#10b981' },
    { name: 'Chronic', value: stats?.diagnosisStatusBreakdown?.chronic || 0, color: '#8b5cf6' }
  ];

  return (
    <Layout title="Dashboard">
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #3b82f6)', borderRadius: 20, padding: '28px 32px', color: '#fff', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(59,130,246,0.2)' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p style={{ fontSize: 14, opacity: 0.85, fontWeight: 500 }}>CareTrack Clinic · {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, opacity: 0.9 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 16px', backdropFilter: 'blur(10px)', fontWeight: 600 }}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Access
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div className="stat-card blue">
          <div className="stat-icon blue">👨‍⚕️</div>
          <div>
            <div className="stat-label">Active Doctors</div>
            <div className="stat-value">{stats?.totals.doctors ?? '—'}</div>
          </div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon teal">🧑‍🤝‍🧑</div>
          <div>
            <div className="stat-label">Registered Patients</div>
            <div className="stat-value">{stats?.totals.patients ?? '—'}</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange">🩺</div>
          <div>
            <div className="stat-label">Total Diagnoses</div>
            <div className="stat-value">{stats?.totals.diagnoses ?? '—'}</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-label">Resolved Cases</div>
            <div className="stat-value">{stats?.diagnosisStatusBreakdown.resolved ?? '—'}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="ct-card">
          <div className="ct-card-header"><span className="ct-card-title">📊 Patients by Specialty</span></div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={specialtyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: 'rgba(59,130,246,0.05)' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="Patients" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ct-card">
          <div className="ct-card-header"><span className="ct-card-title">🩺 Diagnosis Severity & Status</span></div>
          <div style={{ display: 'flex', height: 300 }}>
            <div style={{ flex: 1 }}>
              <h5 style={{ textAlign: 'center', fontSize: 13, color: '#64748b', fontWeight: 600 }}>Severity</h5>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              <h5 style={{ textAlign: 'center', fontSize: 13, color: '#64748b', fontWeight: 600 }}>Case Status</h5>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={diagnosisStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {diagnosisStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Recent Patients */}
        <div className="ct-card">
          <div className="ct-card-header">
            <span className="ct-card-title">🧑‍🤝‍🧑 Recent Patient Registrations</span>
            <button className="btn-ct-outline" onClick={() => navigate('/patients')}>View All</button>
          </div>
          {stats?.recentPatients?.length === 0
            ? <div className="empty-state"><div className="icon">👤</div><div>No patients registered yet</div></div>
            : <table className="ct-table">
                <thead><tr><th>Patient</th><th>Assigned Doctor</th><th>Registered</th></tr></thead>
                <tbody>
                  {stats?.recentPatients?.map(p => (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/patients/${p.id}`)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <strong>{p.firstName} {p.lastName}</strong>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{p.doctorName}</td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(p.registeredAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        {/* Recent Diagnoses */}
        <div className="ct-card">
          <div className="ct-card-header">
            <span className="ct-card-title">🩺 Recent Diagnoses</span>
            <button className="btn-ct-outline" onClick={() => navigate('/diseases')}>View All</button>
          </div>
          {stats?.recentDiseases?.length === 0
            ? <div className="empty-state"><div className="icon">🩺</div><div>No diagnoses recorded yet</div></div>
            : <table className="ct-table">
                <thead><tr><th>Diagnosis</th><th>Patient</th><th>Severity</th></tr></thead>
                <tbody>
                  {stats?.recentDiseases?.map(d => (
                    <tr key={d.id}>
                      <td><strong style={{ display: 'block', marginBottom: 4 }}>{d.name}</strong><span style={{ display: 'inline-block', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{d.icdCode}</span></td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{d.patientName}</td>
                      <td><span className={`badge-severity-${d.severity}`}>{d.severity}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

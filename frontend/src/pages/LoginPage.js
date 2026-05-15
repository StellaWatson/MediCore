import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { label: 'Admin', email: 'admin@caretrack.uz', role: 'administrator' },
    { label: 'Clinician', email: 'clinician@caretrack.uz', role: 'clinician' },
    { label: 'Receptionist', email: 'receptionist@caretrack.uz', role: 'receptionist' },
  ];

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
          <div className="brand">CareTrack MRMS</div>
          <div className="sub">Medical Record Management System</div>
          <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>MediCore Solutions · CareTrack Clinic</div>
        </div>

        {error && <div className="ct-alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="your.name@caretrack.uz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-ct-primary" style={{ width: '100%', padding: '10px', fontSize: 14 }} disabled={loading}>
            {loading ? 'Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        {/* Demo login shortcuts */}
        <div style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: '#a0aec0', textAlign: 'center', marginBottom: 10 }}>DEMO ACCOUNTS (password: password)</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {demoCredentials.map(({ label, email: demoEmail }) => (
              <button
                key={label}
                onClick={() => { setEmail(demoEmail); setPassword('password'); }}
                style={{ flex: 1, padding: '6px', fontSize: 11, background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

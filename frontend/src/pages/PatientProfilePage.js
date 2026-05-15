import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PatientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [diagForm, setDiagForm] = useState({ icdCode: '', name: '', description: '', severity: '', treatment: '', notes: '', diagnosedDate: '' });
  const [diagError, setDiagError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/patients/${id}`);
      setProfile(r.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, [id]);

  const addDiagnosis = async () => {
    setDiagError('');
    if (!diagForm.icdCode || !diagForm.name || !diagForm.severity) {
      setDiagError('ICD code, name and severity are required.'); return;
    }
    setSaving(true);
    try {
      await api.post('/diseases', { ...diagForm, patientId: id });
      setShowDiagModal(false);
      setDiagForm({ icdCode: '', name: '', description: '', severity: '', treatment: '', notes: '', diagnosedDate: '' });
      fetchProfile();
    } catch (err) {
      setDiagError(err.response?.data?.message || 'Failed to save diagnosis.');
    } finally { setSaving(false); }
  };

  const deleteDiagnosis = async (disId) => {
    if (!window.confirm('Delete this diagnosis?')) return;
    await api.delete(`/diseases/${disId}`);
    fetchProfile();
  };

  const calcAge = (dob) => Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  if (loading) return <Layout title="Patient Profile"><div style={{ padding: 48, textAlign: 'center' }}>Loading...</div></Layout>;
  if (!profile) return <Layout title="Patient Profile"><div className="ct-alert-danger">Patient not found.</div></Layout>;

  return (
    <Layout title="Patient Profile">
      <div style={{ marginBottom: 16 }}>
        <button className="btn-ct-outline" onClick={() => navigate('/patients')}>← Back to Patients</button>
      </div>

      {/* Patient header */}
      <div className="ct-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#1a73e8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, flexShrink: 0 }}>
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{profile.firstName} {profile.lastName}</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#718096', marginBottom: 12 }}>
              <span>📅 DOB: {new Date(profile.dateOfBirth).toLocaleDateString('en-GB')} ({calcAge(profile.dateOfBirth)} yrs)</span>
              <span>⚧ {profile.gender?.charAt(0).toUpperCase() + profile.gender?.slice(1)}</span>
              <span>🩸 Blood: <strong>{profile.bloodType || 'N/A'}</strong></span>
              <span>📱 {profile.phone}</span>
              <span>✉️ {profile.email}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, color: '#718096' }}>
              <span>🏠 {profile.address}</span>
              {profile.emergencyContact && <span>🆘 Emergency: {profile.emergencyContact}</span>}
            </div>
          </div>
          <span className={`badge-status-${profile.status}`} style={{ fontSize: 12 }}>{profile.status}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Assigned Doctor card */}
        <div>
          <div className="ct-card">
            <div className="ct-card-header"><span className="ct-card-title">👨‍⚕️ Assigned Doctor</span></div>
            {profile.doctor ? (
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{profile.doctor.name}</div>
                <div style={{ fontSize: 12, color: '#718096', marginBottom: 8 }}>{profile.doctor.specialty}</div>
                <div style={{ fontSize: 12, marginBottom: 4 }}>🏥 {profile.doctor.department}</div>
                <div style={{ fontSize: 12, marginBottom: 4 }}>✉️ {profile.doctor.email}</div>
                <div style={{ fontSize: 12 }}>📱 {profile.doctor.phone}</div>
              </div>
            ) : <div style={{ color: '#718096', fontSize: 13 }}>No doctor assigned</div>}
          </div>

          {/* Quick stats */}
          <div className="ct-card" style={{ marginTop: 16 }}>
            <div className="ct-card-header"><span className="ct-card-title">📊 Diagnosis Summary</span></div>
            <div style={{ fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f4f8' }}>
                <span>Total Diagnoses</span><strong>{profile.diagnosisHistory?.length || 0}</strong>
              </div>
              {['ongoing', 'resolved', 'chronic'].map(s => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f4f8' }}>
                  <span style={{ textTransform: 'capitalize' }}>{s}</span>
                  <strong>{profile.diagnosisHistory?.filter(d => d.status === s).length || 0}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnosis history */}
        <div className="ct-card">
          <div className="ct-card-header">
            <span className="ct-card-title">🩺 Diagnosis History ({profile.diagnosisHistory?.length || 0})</span>
            {hasRole('administrator', 'clinician') && (
              <button className="btn-ct-primary" onClick={() => setShowDiagModal(true)}>+ Add Diagnosis</button>
            )}
          </div>
          {!profile.diagnosisHistory?.length
            ? <div className="empty-state"><div className="icon">🩺</div><h6>No diagnoses recorded</h6></div>
            : profile.diagnosisHistory.map(d => (
              <div key={d.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</span>
                    <span style={{ marginLeft: 8, background: '#f0f4f8', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: '#4a5568' }}>{d.icdCode}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge-severity-${d.severity}`}>{d.severity}</span>
                    <span className={`badge-status-${d.status}`}>{d.status}</span>
                    {hasRole('administrator') && <button className="btn-ct-danger" style={{ padding: '3px 10px', fontSize: 11 }} onClick={() => deleteDiagnosis(d.id)}>Delete</button>}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#4a5568', marginBottom: 6 }}>{d.description}</p>
                {d.treatment && <div style={{ fontSize: 12, color: '#718096' }}><strong>Treatment:</strong> {d.treatment}</div>}
                {d.notes && <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}><strong>Notes:</strong> {d.notes}</div>}
                <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 8 }}>Diagnosed: {new Date(d.diagnosedDate).toLocaleDateString('en-GB')}</div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Add Diagnosis Modal */}
      {showDiagModal && (
        <div className="modal-overlay" onClick={() => setShowDiagModal(false)}>
          <div className="modal-box" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>➕ Add Diagnosis for {profile.firstName} {profile.lastName}</h5>
              <button onClick={() => setShowDiagModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              {diagError && <div className="ct-alert-danger">{diagError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">ICD Code *</label>
                  <input className="form-control" placeholder="e.g. I10" value={diagForm.icdCode} onChange={e => setDiagForm(f => ({ ...f, icdCode: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Condition Name *</label>
                  <input className="form-control" placeholder="e.g. Essential Hypertension" value={diagForm.name} onChange={e => setDiagForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Severity *</label>
                  <select className="form-control" value={diagForm.severity} onChange={e => setDiagForm(f => ({ ...f, severity: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date Diagnosed</label>
                  <input type="date" className="form-control" value={diagForm.diagnosedDate} onChange={e => setDiagForm(f => ({ ...f, diagnosedDate: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} placeholder="Clinical description..." value={diagForm.description} onChange={e => setDiagForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Treatment Plan</label>
                  <textarea className="form-control" rows={2} placeholder="Medications, therapy..." value={diagForm.treatment} onChange={e => setDiagForm(f => ({ ...f, treatment: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Clinical Notes</label>
                  <textarea className="form-control" rows={2} placeholder="Additional notes..." value={diagForm.notes} onChange={e => setDiagForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ct-outline" onClick={() => setShowDiagModal(false)}>Cancel</button>
              <button className="btn-ct-primary" onClick={addDiagnosis} disabled={saving}>{saving ? 'Saving...' : 'Save Diagnosis'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PatientProfilePage;

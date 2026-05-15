import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DiseasesPage = () => {
  const [diseases, setDiseases] = useState([]);
  const [total, setTotal] = useState(0);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editDisease, setEditDisease] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/patients?limit=200').then(r => setPatients(r.data.data)).catch(() => {});
  }, []);

  const fetchDiseases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (severityFilter) params.append('severity', severityFilter);
      if (statusFilter) params.append('status', statusFilter);
      const r = await api.get(`/diseases?${params}`);
      setDiseases(r.data.data); setTotal(r.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, severityFilter, statusFilter]);

  useEffect(() => { fetchDiseases(); }, [fetchDiseases]);

  const openEdit = (d) => {
    setEditDisease(d);
    setForm({ icdCode: d.icdCode, name: d.name, description: d.description, severity: d.severity, status: d.status, treatment: d.treatment, notes: d.notes });
    setFormError(''); setShowModal(true);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/diseases/${editDisease.id}`, form);
      setShowModal(false); fetchDiseases();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this diagnosis?')) return;
    await api.delete(`/diseases/${id}`);
    fetchDiseases();
  };

  return (
    <Layout title="Disease / Diagnosis Records">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-bar-icon">🔍</span>
          <input className="form-control" placeholder="Search by name, ICD code..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 150 }} value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
          <option value="">All Severities</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
        <select className="form-control" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="ongoing">Ongoing</option>
          <option value="resolved">Resolved</option>
          <option value="chronic">Chronic</option>
        </select>
      </div>

      <div className="ct-card">
        <div className="ct-card-header">
          <span className="ct-card-title">🩺 Diagnosis Records ({total})</span>
        </div>
        {loading
          ? <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>
          : diseases.length === 0
          ? <div className="empty-state"><div className="icon">🩺</div><h6>No diagnoses found</h6></div>
          : <table className="ct-table">
              <thead>
                <tr><th>ICD Code</th><th>Condition</th><th>Patient</th><th>Severity</th><th>Status</th><th>Diagnosed</th>{hasRole('administrator', 'clinician') && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {diseases.map(d => (
                  <tr key={d.id}>
                    <td><span style={{ background: '#f0f4f8', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{d.icdCode}</span></td>
                    <td>
                      <strong>{d.name}</strong>
                      <div style={{ fontSize: 11, color: '#718096', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description}</div>
                    </td>
                    <td style={{ fontSize: 13, cursor: 'pointer', color: '#1a73e8' }} onClick={() => navigate(`/patients/${d.patientId}`)}>{d.patientName}</td>
                    <td><span className={`badge-severity-${d.severity}`}>{d.severity}</span></td>
                    <td><span className={`badge-status-${d.status}`}>{d.status}</span></td>
                    <td style={{ fontSize: 12 }}>{new Date(d.diagnosedDate).toLocaleDateString('en-GB')}</td>
                    {hasRole('administrator', 'clinician') && (
                      <td>
                        <button className="btn-ct-outline" style={{ marginRight: 6 }} onClick={() => openEdit(d)}>Edit</button>
                        {hasRole('administrator') && <button className="btn-ct-danger" onClick={() => handleDelete(d.id)}>Delete</button>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>✏️ Edit Diagnosis</h5>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              {formError && <div className="ct-alert-danger">{formError}</div>}
              {[
                { key: 'icdCode', label: 'ICD Code' },
                { key: 'name', label: 'Condition Name' },
              ].map(({ key, label }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input className="form-control" value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Severity</label>
                  <select className="form-control" value={form.severity || ''} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                    <option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="ongoing">Ongoing</option><option value="resolved">Resolved</option><option value="chronic">Chronic</option>
                  </select>
                </div>
              </div>
              {['description', 'treatment', 'notes'].map(key => (
                <div className="form-group" key={key}>
                  <label className="form-label" style={{ textTransform: 'capitalize' }}>{key}</label>
                  <textarea className="form-control" rows={2} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-ct-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-ct-primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DiseasesPage;

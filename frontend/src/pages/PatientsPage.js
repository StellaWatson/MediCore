import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const emptyForm = { firstName: '', lastName: '', dateOfBirth: '', gender: '', bloodType: '', phone: '', email: '', address: '', emergencyContact: '', doctorId: '' };

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/doctors?limit=100').then(r => setDoctors(r.data.data)).catch(() => {});
  }, []);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (doctorFilter) params.append('doctorId', doctorFilter);
      const r = await api.get(`/patients?${params}`);
      setPatients(r.data.data);
      setTotal(r.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, doctorFilter]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const openAdd = () => { setEditPatient(null); setForm(emptyForm); setFormError(''); setShowModal(true); };
  const openEdit = (p) => {
    setEditPatient(p);
    setForm({ firstName: p.firstName, lastName: p.lastName, dateOfBirth: p.dateOfBirth, gender: p.gender, bloodType: p.bloodType, phone: p.phone, email: p.email, address: p.address, emergencyContact: p.emergencyContact, doctorId: p.doctorId });
    setFormError(''); setShowModal(true);
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.gender || !form.doctorId) {
      setFormError('Please fill in all required fields.'); return;
    }
    setSaving(true);
    try {
      if (editPatient) {
        await api.put(`/patients/${editPatient.id}`, form);
      } else {
        await api.post('/patients', form);
      }
      setShowModal(false); fetchPatients();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save patient.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/patients/${id}`); setDeleteConfirm(null); fetchPatients(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete.'); }
  };

  const calcAge = (dob) => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <Layout title="Patients Management">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-bar-icon">🔍</span>
          <input className="form-control" placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 200 }} value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}>
          <option value="">All Doctors</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {hasRole('administrator', 'receptionist') && (
          <button className="btn-ct-primary" onClick={openAdd}>+ Register Patient</button>
        )}
      </div>

      <div className="ct-card">
        <div className="ct-card-header">
          <span className="ct-card-title">🧑‍🤝‍🧑 Patient Records ({total})</span>
        </div>
        {loading ? <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>
          : patients.length === 0
          ? <div className="empty-state"><div className="icon">🧑</div><h6>No patients found</h6></div>
          : <table className="ct-table">
              <thead>
                <tr><th>Patient</th><th>Age / DOB</th><th>Blood Type</th><th>Assigned Doctor</th><th>Contact</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong style={{ cursor: 'pointer', color: '#1a73e8' }} onClick={() => navigate(`/patients/${p.id}`)}>{p.firstName} {p.lastName}</strong>
                      <div style={{ fontSize: 11, color: '#718096' }}>{p.id}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{calcAge(p.dateOfBirth)} yrs<div style={{ color: '#718096' }}>{new Date(p.dateOfBirth).toLocaleDateString('en-GB')}</div></td>
                    <td><span style={{ background: '#e8f0fe', color: '#1565c0', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{p.bloodType || 'N/A'}</span></td>
                    <td style={{ fontSize: 12 }}>{p.doctorName}<div style={{ color: '#718096' }}>{p.doctorSpecialty}</div></td>
                    <td style={{ fontSize: 12 }}>{p.phone}</td>
                    <td><span className={`badge-status-${p.status}`}>{p.status}</span></td>
                    <td>
                      <button className="btn-ct-outline" style={{ marginRight: 6 }} onClick={() => navigate(`/patients/${p.id}`)}>View</button>
                      {hasRole('administrator', 'clinician') && <button className="btn-ct-outline" style={{ marginRight: 6 }} onClick={() => openEdit(p)}>Edit</button>}
                      {hasRole('administrator') && <button className="btn-ct-danger" onClick={() => setDeleteConfirm(p)}>Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{editPatient ? '✏️ Edit Patient' : '➕ Register New Patient'}</h5>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              {formError && <div className="ct-alert-danger">{formError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'firstName', label: 'First Name *' },
                  { key: 'lastName', label: 'Last Name *' },
                  { key: 'dateOfBirth', label: 'Date of Birth *', type: 'date' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'email', label: 'Email Address' },
                  { key: 'address', label: 'Home Address' },
                  { key: 'emergencyContact', label: 'Emergency Contact' },
                ].map(({ key, label, type }) => (
                  <div className="form-group" key={key}>
                    <label className="form-label">{label}</label>
                    <input type={type || 'text'} className="form-control" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select className="form-control" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Type</label>
                  <select className="form-control" value={form.bloodType} onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => <option key={bt}>{bt}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Doctor *</label>
                  <select className="form-control" value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}>
                    <option value="">Select doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ct-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-ct-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Patient'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-header"><h5>⚠️ Confirm Deletion</h5></div>
            <div className="modal-body"><p>Delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong> and all their diagnoses? This cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn-ct-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-ct-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PatientsPage;

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SPECIALTIES = ['General Practice', 'Cardiology', 'Neurology', 'Dermatology', 'Orthopaedics', 'Gynaecology', 'Paediatrics', 'Oncology', 'Radiology', 'Psychiatry'];

const emptyForm = { name: '', specialty: '', department: '', email: '', phone: '', licenseNumber: '', experience: '' };

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { hasRole } = useAuth();

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (specialty) params.append('specialty', specialty);
      const r = await api.get(`/doctors?${params}`);
      setDoctors(r.data.data);
      setTotal(r.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, specialty]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const openAdd = () => { setEditDoctor(null); setForm(emptyForm); setFormError(''); setShowModal(true); };
  const openEdit = (doc) => { setEditDoctor(doc); setForm({ name: doc.name, specialty: doc.specialty, department: doc.department, email: doc.email, phone: doc.phone, licenseNumber: doc.licenseNumber, experience: doc.experience }); setFormError(''); setShowModal(true); };

  const handleSave = async () => {
    setFormError('');
    if (!form.name || !form.specialty || !form.department || !form.email) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      if (editDoctor) {
        await api.put(`/doctors/${editDoctor.id}`, form);
      } else {
        await api.post('/doctors', form);
      }
      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save doctor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/doctors/${id}`);
      setDeleteConfirm(null);
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <Layout title="Doctors Management">
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-bar-icon">🔍</span>
          <input className="form-control" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 180 }} value={specialty} onChange={e => setSpecialty(e.target.value)}>
          <option value="">All Specialties</option>
          {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
        </select>
        {hasRole('administrator') && (
          <button className="btn-ct-primary" onClick={openAdd}>+ Add Doctor</button>
        )}
      </div>

      <div className="ct-card">
        <div className="ct-card-header">
          <span className="ct-card-title">👨‍⚕️ Doctor Profiles ({total})</span>
        </div>
        {loading ? <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>
          : doctors.length === 0
          ? <div className="empty-state"><div className="icon">👨‍⚕️</div><h6>No doctors found</h6><p>Adjust search or add a new doctor</p></div>
          : <table className="ct-table">
              <thead>
                <tr>
                  <th>Name</th><th>Specialty</th><th>Department</th>
                  <th>Contact</th><th>Experience</th><th>Status</th>
                  {hasRole('administrator') && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.name}</strong>
                      <div style={{ fontSize: 11, color: '#718096' }}>{d.licenseNumber}</div>
                    </td>
                    <td>{d.specialty}</td>
                    <td style={{ fontSize: 12 }}>{d.department}</td>
                    <td style={{ fontSize: 12 }}>
                      <div>{d.email}</div>
                      <div style={{ color: '#718096' }}>{d.phone}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{d.experience} yrs</td>
                    <td><span className={`badge-status-${d.status}`}>{d.status}</span></td>
                    {hasRole('administrator') && (
                      <td>
                        <button className="btn-ct-outline" style={{ marginRight: 6 }} onClick={() => openEdit(d)}>Edit</button>
                        <button className="btn-ct-danger" onClick={() => setDeleteConfirm(d)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{editDoctor ? '✏️ Edit Doctor' : '➕ Add New Doctor'}</h5>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              {formError && <div className="ct-alert-danger">{formError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'name', label: 'Full Name *', placeholder: 'Dr. Firstname Lastname' },
                  { key: 'email', label: 'Email Address *', placeholder: 'doctor@caretrack.uz' },
                  { key: 'department', label: 'Department *', placeholder: 'e.g. Cardiology Department' },
                  { key: 'phone', label: 'Phone Number', placeholder: '+998 90 000 0000' },
                  { key: 'licenseNumber', label: 'License Number', placeholder: 'UZ-MED-2020-0000' },
                  { key: 'experience', label: 'Years of Experience', placeholder: '10', type: 'number' },
                ].map(({ key, label, placeholder, type }) => (
                  <div className="form-group" key={key}>
                    <label className="form-label">{label}</label>
                    <input type={type || 'text'} className="form-control" placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Specialty *</label>
                  <select className="form-control" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}>
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ct-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-ct-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Doctor'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-header"><h5>⚠️ Confirm Deletion</h5></div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            </div>
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

export default DoctorsPage;

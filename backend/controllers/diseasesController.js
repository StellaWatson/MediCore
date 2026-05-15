/**
 * diseasesController.js
 * CRUD operations for Disease/Diagnosis records.
 * Administrator: full access. Clinician: view/update/create.
 */

const { v4: uuidv4 } = require('uuid');
const { readAll, findById, insert, update, remove, findWhere } = require('../utils/db');

/**
 * GET /api/diseases
 * Returns all diagnoses with optional filter.
 * ?patientId=p001&severity=severe&status=ongoing&search=diabetes
 */
const getDiseases = (req, res) => {
  try {
    let diseases = readAll('diseases');
    const patients = readAll('patients');
    const { patientId, severity, status, search, icdCode, page = 1, limit = 20 } = req.query;

    if (patientId) diseases = diseases.filter((d) => d.patientId === patientId);
    if (severity) diseases = diseases.filter((d) => d.severity === severity);
    if (status) diseases = diseases.filter((d) => d.status === status);
    if (icdCode) diseases = diseases.filter((d) => d.icdCode.toLowerCase().includes(icdCode.toLowerCase()));
    if (search) {
      const q = search.toLowerCase();
      diseases = diseases.filter(
        (d) => d.name.toLowerCase().includes(q) || d.icdCode.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
      );
    }

    // Enrich with patient name
    const enriched = diseases.map((d) => {
      const patient = patients.find((p) => p.id === d.patientId);
      return { ...d, patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown' };
    });

    const total = enriched.length;
    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const paginated = enriched.slice(startIdx, startIdx + parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), limit: parseInt(limit), data: paginated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve diagnoses.' });
  }
};

/**
 * GET /api/diseases/:id
 */
const getDiseaseById = (req, res) => {
  try {
    const disease = findById('diseases', req.params.id);
    if (!disease) return res.status(404).json({ success: false, message: 'Diagnosis not found.' });

    const patient = findById('patients', disease.patientId);
    const doctor = patient ? findById('doctors', patient.doctorId) : null;
    res.json({ success: true, data: { ...disease, patient: patient || null, doctor: doctor || null } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve diagnosis.' });
  }
};

/**
 * POST /api/diseases
 * Creates a new diagnosis record linked to a patient.
 */
const createDisease = (req, res) => {
  try {
    const { patientId, icdCode, name, description, severity, treatment, notes, diagnosedDate } = req.body;

    if (!patientId || !icdCode || !name || !severity) {
      return res.status(400).json({ success: false, message: 'Patient, ICD code, name and severity are required.' });
    }

    const patient = findById('patients', patientId);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    const newDisease = {
      id: 'dis' + uuidv4().slice(0, 8),
      patientId,
      icdCode: icdCode.trim().toUpperCase(),
      name: name.trim(),
      description: description || '',
      severity,
      status: 'ongoing',
      diagnosedDate: diagnosedDate || new Date().toISOString(),
      treatment: treatment || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = insert('diseases', newDisease);
    res.status(201).json({ success: true, message: 'Diagnosis created successfully.', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create diagnosis.' });
  }
};

/**
 * PUT /api/diseases/:id
 */
const updateDisease = (req, res) => {
  try {
    const disease = findById('diseases', req.params.id);
    if (!disease) return res.status(404).json({ success: false, message: 'Diagnosis not found.' });

    const allowedFields = ['icdCode', 'name', 'description', 'severity', 'status', 'treatment', 'notes', 'diagnosedDate'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = update('diseases', req.params.id, updates);
    res.json({ success: true, message: 'Diagnosis updated successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update diagnosis.' });
  }
};

/**
 * DELETE /api/diseases/:id
 * Administrator only.
 */
const deleteDisease = (req, res) => {
  try {
    const disease = findById('diseases', req.params.id);
    if (!disease) return res.status(404).json({ success: false, message: 'Diagnosis not found.' });

    remove('diseases', req.params.id);
    res.json({ success: true, message: 'Diagnosis deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete diagnosis.' });
  }
};

module.exports = { getDiseases, getDiseaseById, createDisease, updateDisease, deleteDisease };

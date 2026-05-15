/**
 * patientsController.js
 * CRUD operations for Patient records.
 * Administrator: full access. Clinician: view/update. Receptionist: register/view.
 */

const { v4: uuidv4 } = require('uuid');
const { readAll, findById, insert, update, remove, findWhere } = require('../utils/db');

/**
 * GET /api/patients
 * Returns all patients with optional search and filter.
 * ?search=name&doctorId=d001&status=active&page=1&limit=10
 */
const getPatients = (req, res) => {
  try {
    let patients = readAll('patients');
    const doctors = readAll('doctors');
    const { search, doctorId, status, bloodType, page = 1, limit = 20 } = req.query;

    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.includes(q)
      );
    }
    if (doctorId) patients = patients.filter((p) => p.doctorId === doctorId);
    if (status) patients = patients.filter((p) => p.status === status);
    if (bloodType) patients = patients.filter((p) => p.bloodType === bloodType);

    // Enrich with doctor name
    const enriched = patients.map((p) => {
      const doctor = doctors.find((d) => d.id === p.doctorId);
      return { ...p, doctorName: doctor ? doctor.name : 'Unassigned', doctorSpecialty: doctor ? doctor.specialty : '' };
    });

    const total = enriched.length;
    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const paginated = enriched.slice(startIdx, startIdx + parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), limit: parseInt(limit), data: paginated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve patients.' });
  }
};

/**
 * GET /api/patients/:id
 * Returns a full patient profile including doctor details and diagnosis history.
 */
const getPatientById = (req, res) => {
  try {
    const patient = findById('patients', req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    const doctor = findById('doctors', patient.doctorId);
    const diseases = findWhere('diseases', (d) => d.patientId === patient.id);

    res.json({
      success: true,
      data: { ...patient, doctor: doctor || null, diagnosisHistory: diseases }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve patient.' });
  }
};

/**
 * POST /api/patients
 * Registers a new patient. Administrator and Receptionist.
 */
const createPatient = (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, bloodType, phone, email, address, emergencyContact, doctorId } = req.body;

    if (!firstName || !lastName || !dateOfBirth || !gender || !doctorId) {
      return res.status(400).json({ success: false, message: 'First name, last name, date of birth, gender and doctor are required.' });
    }

    // Verify doctor exists
    const doctor = findById('doctors', doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Assigned doctor not found.' });

    const newPatient = {
      id: 'p' + uuidv4().slice(0, 8),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      gender,
      bloodType: bloodType || '',
      phone: phone || '',
      email: email ? email.toLowerCase().trim() : '',
      address: address || '',
      emergencyContact: emergencyContact || '',
      doctorId,
      status: 'active',
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = insert('patients', newPatient);
    res.status(201).json({ success: true, message: 'Patient registered successfully.', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to register patient.' });
  }
};

/**
 * PUT /api/patients/:id
 * Updates patient record. Administrator and Clinician.
 */
const updatePatient = (req, res) => {
  try {
    const patient = findById('patients', req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    const allowedFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'bloodType', 'phone', 'email', 'address', 'emergencyContact', 'doctorId', 'status'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.doctorId) {
      const doctor = findById('doctors', updates.doctorId);
      if (!doctor) return res.status(404).json({ success: false, message: 'Assigned doctor not found.' });
    }

    const updated = update('patients', req.params.id, updates);
    res.json({ success: true, message: 'Patient updated successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update patient.' });
  }
};

/**
 * DELETE /api/patients/:id
 * Deletes patient and all linked diagnoses. Administrator only.
 */
const deletePatient = (req, res) => {
  try {
    const patient = findById('patients', req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    // Cascade-delete linked disease records
    const diseases = readAll('diseases');
    const remaining = diseases.filter((d) => d.patientId !== req.params.id);
    const { writeAll } = require('../utils/db');
    writeAll('diseases', remaining);

    remove('patients', req.params.id);
    res.json({ success: true, message: 'Patient and all linked diagnoses deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete patient.' });
  }
};

module.exports = { getPatients, getPatientById, createPatient, updatePatient, deletePatient };

/**
 * doctorsController.js
 * CRUD operations for Doctor profiles.
 * Administrators have full access; Receptionists can view only.
 */

const { v4: uuidv4 } = require('uuid');
const { readAll, findById, insert, update, remove, findWhere } = require('../utils/db');

/**
 * GET /api/doctors
 * Returns all doctors, with optional search/filter query params:
 *   ?search=name&specialty=Cardiology&status=active&page=1&limit=10
 */
const getDoctors = (req, res) => {
  try {
    let doctors = readAll('doctors');
    const { search, specialty, status, page = 1, limit = 20 } = req.query;

    // Filter by search term (name or email)
    if (search) {
      const q = search.toLowerCase();
      doctors = doctors.filter(
        (d) => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q)
      );
    }

    // Filter by specialty
    if (specialty) {
      doctors = doctors.filter((d) => d.specialty.toLowerCase() === specialty.toLowerCase());
    }

    // Filter by status
    if (status) {
      doctors = doctors.filter((d) => d.status === status);
    }

    // Pagination
    const total = doctors.length;
    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const paginated = doctors.slice(startIdx, startIdx + parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: paginated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve doctors.' });
  }
};

/**
 * GET /api/doctors/:id
 * Returns a single doctor profile with their list of patients.
 */
const getDoctorById = (req, res) => {
  try {
    const doctor = findById('doctors', req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    // Attach patients assigned to this doctor
    const patients = findWhere('patients', (p) => p.doctorId === doctor.id);
    res.json({ success: true, data: { ...doctor, patients } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve doctor.' });
  }
};

/**
 * POST /api/doctors
 * Creates a new doctor profile. Administrator only.
 */
const createDoctor = (req, res) => {
  try {
    const { name, specialty, department, email, phone, licenseNumber, experience } = req.body;

    if (!name || !specialty || !department || !email) {
      return res.status(400).json({ success: false, message: 'Name, specialty, department and email are required.' });
    }

    // Check for duplicate email
    const existing = findWhere('doctors', (d) => d.email.toLowerCase() === email.toLowerCase());
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A doctor with this email already exists.' });
    }

    const newDoctor = {
      id: 'd' + uuidv4().slice(0, 8),
      name: name.trim(),
      specialty: specialty.trim(),
      department: department.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      licenseNumber: licenseNumber || '',
      experience: parseInt(experience) || 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = insert('doctors', newDoctor);
    res.status(201).json({ success: true, message: 'Doctor created successfully.', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create doctor.' });
  }
};

/**
 * PUT /api/doctors/:id
 * Updates an existing doctor profile. Administrator only.
 */
const updateDoctor = (req, res) => {
  try {
    const doctor = findById('doctors', req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const allowedFields = ['name', 'specialty', 'department', 'email', 'phone', 'licenseNumber', 'experience', 'status'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = update('doctors', req.params.id, updates);
    res.json({ success: true, message: 'Doctor updated successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update doctor.' });
  }
};

/**
 * DELETE /api/doctors/:id
 * Deletes a doctor. Administrator only.
 * Prevents deletion if doctor has assigned patients.
 */
const deleteDoctor = (req, res) => {
  try {
    const doctor = findById('doctors', req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const linkedPatients = findWhere('patients', (p) => p.doctorId === req.params.id);
    if (linkedPatients.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete. This doctor has ${linkedPatients.length} assigned patient(s). Reassign them first.`
      });
    }

    remove('doctors', req.params.id);
    res.json({ success: true, message: 'Doctor deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete doctor.' });
  }
};

module.exports = { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };

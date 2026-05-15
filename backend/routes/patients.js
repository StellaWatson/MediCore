const express = require('express');
const router = express.Router();
const { getPatients, getPatientById, createPatient, updatePatient, deletePatient } = require('../controllers/patientsController');
const { protect, authorise } = require('../middleware/auth');
const { validatePatient } = require('../middleware/validate');

router.use(protect);

// View: all roles
router.get('/', getPatients);
router.get('/:id', getPatientById);

// Register: administrator and receptionist
router.post('/', authorise('administrator', 'receptionist'), validatePatient, createPatient);

// Update: administrator and clinician
router.put('/:id', authorise('administrator', 'clinician'), updatePatient);

// Delete: administrator only
router.delete('/:id', authorise('administrator'), deletePatient);

module.exports = router;

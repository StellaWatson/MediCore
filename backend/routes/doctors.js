const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorsController');
const { protect, authorise } = require('../middleware/auth');
const { validateDoctor } = require('../middleware/validate');

// All routes require authentication
router.use(protect);

// View: administrator, clinician, receptionist
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Create/Update/Delete: administrator only
router.post('/', authorise('administrator'), validateDoctor, createDoctor);
router.put('/:id', authorise('administrator'), validateDoctor, updateDoctor);
router.delete('/:id', authorise('administrator'), deleteDoctor);

module.exports = router;

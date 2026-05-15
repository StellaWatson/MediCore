const express = require('express');
const router = express.Router();
const { getDiseases, getDiseaseById, createDisease, updateDisease, deleteDisease } = require('../controllers/diseasesController');
const { protect, authorise } = require('../middleware/auth');
const { validateDisease } = require('../middleware/validate');

router.use(protect);

// View: all roles
router.get('/', getDiseases);
router.get('/:id', getDiseaseById);

// Create/Update: administrator and clinician
router.post('/', authorise('administrator', 'clinician'), validateDisease, createDisease);
router.put('/:id', authorise('administrator', 'clinician'), updateDisease);

// Delete: administrator only
router.delete('/:id', authorise('administrator'), deleteDisease);

module.exports = router;

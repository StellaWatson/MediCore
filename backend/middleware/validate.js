/**
 * validate.js - Request Validation Middleware
 * Lightweight validation layer that runs before controllers.
 * Returns clear 400 errors so the frontend can display them.
 */

/**
 * validateLogin - ensures email and password are present and formatted.
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('A valid email address is required.');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }
  next();
};

/**
 * validateDoctor - checks required fields for creating/updating a doctor.
 */
const validateDoctor = (req, res, next) => {
  const { name, specialty, department, email } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) errors.push('Doctor name must be at least 3 characters.');
  if (!specialty || specialty.trim().length < 2) errors.push('Specialty is required.');
  if (!department || department.trim().length < 2) errors.push('Department is required.');
  if (!email || !email.includes('@')) errors.push('A valid email address is required.');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }
  next();
};

/**
 * validatePatient - checks required fields for registering a patient.
 */
const validatePatient = (req, res, next) => {
  const { firstName, lastName, dateOfBirth, gender, doctorId } = req.body;
  const errors = [];

  if (!firstName || firstName.trim().length < 2) errors.push('First name must be at least 2 characters.');
  if (!lastName || lastName.trim().length < 2) errors.push('Last name must be at least 2 characters.');
  if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) errors.push('A valid date of birth is required.');
  if (!gender || !['male', 'female', 'other'].includes(gender)) errors.push('Gender must be male, female, or other.');
  if (!doctorId || typeof doctorId !== 'string') errors.push('An assigned doctor ID is required.');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }
  next();
};

/**
 * validateDisease - checks required fields for a diagnosis record.
 */
const validateDisease = (req, res, next) => {
  const { patientId, icdCode, name, severity } = req.body;
  const errors = [];
  const validSeverities = ['mild', 'moderate', 'severe'];

  if (!patientId) errors.push('Patient ID is required.');
  if (!icdCode || icdCode.trim().length < 2) errors.push('ICD code is required (e.g. I10, E11.9).');
  if (!name || name.trim().length < 3) errors.push('Condition name must be at least 3 characters.');
  if (!severity || !validSeverities.includes(severity)) {
    errors.push('Severity must be mild, moderate, or severe.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }
  next();
};

module.exports = { validateLogin, validateDoctor, validatePatient, validateDisease };

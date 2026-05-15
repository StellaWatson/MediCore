/**
 * tests/mrms.test.js
 * CareTrack MRMS - Manual & Automated Test Suite
 * 
 * Run with:  node tests/mrms.test.js
 * 
 * Tests cover:
 *   - Database utility functions (db.js)
 *   - Authentication logic
 *   - RBAC middleware
 *   - Validation middleware
 *   - CRUD operations for all entities
 *   - Data relationship integrity
 *   - Dashboard statistics
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readAll, findById, insert, update, remove, findWhere } = require('../utils/db');
const { validateLogin, validateDoctor, validatePatient, validateDisease } = require('../middleware/validate');

// ─── Simple test runner ────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✅  ${description}`);
    passed++;
  } catch (err) {
    console.log(`  ❌  ${description}`);
    console.log(`       → ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(a, b, message) {
  if (a !== b) throw new Error(message || `Expected "${a}" to equal "${b}"`);
}

// Fake res/req/next helpers for middleware testing
function mockRes() {
  const res = { statusCode: 200, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
}
function mockReq(body = {}, user = null, params = {}) {
  return { body, user, params, headers: {} };
}
function mockNext() {
  const fn = () => { fn.called = true; };
  fn.called = false;
  return fn;
}

// ─── TEST SUITE ────────────────────────────────────────────────────────────

console.log('\n🏥 CareTrack MRMS — Test Suite');
console.log('══════════════════════════════════════\n');

// ── 1. Database Utility ────────────────────────────────────────────────────
console.log('📁 1. Database Utility (db.js)');

test('readAll returns an array for doctors', () => {
  const docs = readAll('doctors');
  assert(Array.isArray(docs), 'Expected array');
  assert(docs.length > 0, 'Expected at least one doctor');
});

test('readAll returns an array for patients', () => {
  const pts = readAll('patients');
  assert(Array.isArray(pts), 'Expected array');
  assert(pts.length > 0, 'Expected at least one patient');
});

test('readAll returns an array for diseases', () => {
  const dis = readAll('diseases');
  assert(Array.isArray(dis), 'Expected array');
});

test('readAll returns an array for users', () => {
  const users = readAll('users');
  assert(Array.isArray(users), 'Expected array');
  assert(users.length >= 3, 'Expected at least 3 seed users');
});

test('findById returns correct doctor by id', () => {
  const doc = findById('doctors', 'd001');
  assert(doc !== null, 'Doctor not found');
  assertEqual(doc.id, 'd001');
  assert(doc.name.startsWith('Dr.'), 'Name should start with Dr.');
});

test('findById returns null for non-existent id', () => {
  const doc = findById('doctors', 'NOTEXIST');
  assertEqual(doc, null, 'Expected null for missing id');
});

test('findWhere filters records correctly', () => {
  const patientsOfDoctor = findWhere('patients', p => p.doctorId === 'd001');
  assert(patientsOfDoctor.length > 0, 'Expected patients assigned to d001');
  patientsOfDoctor.forEach(p => assertEqual(p.doctorId, 'd001'));
});

test('insert, findById, then remove a temp record', () => {
  const tempDoc = { id: 'dTEST', name: 'Dr. Test Only', specialty: 'Testing', department: 'QA', email: 'test@qa.uz', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  insert('doctors', tempDoc);
  const found = findById('doctors', 'dTEST');
  assert(found !== null, 'Inserted record not found');
  assertEqual(found.name, 'Dr. Test Only');
  remove('doctors', 'dTEST');
  const gone = findById('doctors', 'dTEST');
  assertEqual(gone, null, 'Record should be deleted');
});

test('update modifies a field and sets updatedAt', () => {
  const original = findById('doctors', 'd001');
  const originalName = original.name;
  update('doctors', 'd001', { phone: '+998 99 TEST' });
  const updated = findById('doctors', 'd001');
  assertEqual(updated.phone, '+998 99 TEST');
  assert(updated.updatedAt, 'updatedAt should be set');
  // Restore
  update('doctors', 'd001', { phone: '+998 90 123 4567' });
});

test('remove returns false for non-existent id', () => {
  const result = remove('doctors', 'NOTEXIST999');
  assertEqual(result, false, 'Should return false when nothing deleted');
});

console.log('');

// ── 2. Authentication ──────────────────────────────────────────────────────
console.log('🔐 2. Authentication');

test('bcrypt hash in users.json validates against "password"', () => {
  const users = readAll('users');
  const admin = users.find(u => u.role === 'administrator');
  assert(admin, 'Admin user not found');
  const match = bcrypt.compareSync('password', admin.password);
  assert(match, 'Password hash does not match "password"');
});

test('bcrypt rejects wrong password', () => {
  const users = readAll('users');
  const admin = users.find(u => u.role === 'administrator');
  const match = bcrypt.compareSync('wrongpassword', admin.password);
  assert(!match, 'Wrong password should not match');
});

test('JWT signs and verifies correctly', () => {
  const payload = { id: 'u001', name: 'Admin User', role: 'administrator', email: 'admin@caretrack.uz' };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assertEqual(decoded.id, 'u001');
  assertEqual(decoded.role, 'administrator');
});

test('JWT verification fails with wrong secret', () => {
  const token = jwt.sign({ id: 'u001' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  let threw = false;
  try { jwt.verify(token, 'WRONG_SECRET'); }
  catch (e) { threw = true; }
  assert(threw, 'Should throw on wrong secret');
});

test('All three demo user roles exist in users.json', () => {
  const users = readAll('users');
  const roles = users.map(u => u.role);
  assert(roles.includes('administrator'), 'Missing administrator');
  assert(roles.includes('clinician'), 'Missing clinician');
  assert(roles.includes('receptionist'), 'Missing receptionist');
});

console.log('');

// ── 3. Validation Middleware ───────────────────────────────────────────────
console.log('✅ 3. Validation Middleware');

test('validateLogin passes with valid credentials', () => {
  const req = mockReq({ email: 'admin@caretrack.uz', password: 'password123' });
  const res = mockRes(); const next = mockNext();
  validateLogin(req, res, next);
  assert(next.called, 'next() should be called for valid input');
});

test('validateLogin blocks missing email', () => {
  const req = mockReq({ password: 'password123' });
  const res = mockRes(); const next = mockNext();
  validateLogin(req, res, next);
  assert(!next.called, 'next() should NOT be called');
  assertEqual(res.statusCode, 400);
});

test('validateLogin blocks short password', () => {
  const req = mockReq({ email: 'admin@caretrack.uz', password: '123' });
  const res = mockRes(); const next = mockNext();
  validateLogin(req, res, next);
  assert(!next.called, 'next() should NOT be called');
  assertEqual(res.statusCode, 400);
});

test('validateDoctor passes with all required fields', () => {
  const req = mockReq({ name: 'Dr. Test Doctor', specialty: 'Cardiology', department: 'Cardiology Dept', email: 'test@caretrack.uz' });
  const res = mockRes(); const next = mockNext();
  validateDoctor(req, res, next);
  assert(next.called, 'next() should be called');
});

test('validateDoctor blocks missing specialty', () => {
  const req = mockReq({ name: 'Dr. Test', department: 'Dept', email: 'test@caretrack.uz' });
  const res = mockRes(); const next = mockNext();
  validateDoctor(req, res, next);
  assert(!next.called, 'next() should NOT be called');
  assertEqual(res.statusCode, 400);
});

test('validatePatient passes with all required fields', () => {
  const req = mockReq({ firstName: 'Jasur', lastName: 'Test', dateOfBirth: '1990-01-01', gender: 'male', doctorId: 'd001' });
  const res = mockRes(); const next = mockNext();
  validatePatient(req, res, next);
  assert(next.called, 'next() should be called');
});

test('validatePatient blocks invalid gender', () => {
  const req = mockReq({ firstName: 'Jasur', lastName: 'Test', dateOfBirth: '1990-01-01', gender: 'unknown', doctorId: 'd001' });
  const res = mockRes(); const next = mockNext();
  validatePatient(req, res, next);
  assert(!next.called, 'next() should NOT be called');
  assertEqual(res.statusCode, 400);
});

test('validateDisease passes with required fields', () => {
  const req = mockReq({ patientId: 'p001', icdCode: 'I10', name: 'Hypertension', severity: 'moderate' });
  const res = mockRes(); const next = mockNext();
  validateDisease(req, res, next);
  assert(next.called, 'next() should be called');
});

test('validateDisease blocks invalid severity', () => {
  const req = mockReq({ patientId: 'p001', icdCode: 'I10', name: 'Hypertension', severity: 'extreme' });
  const res = mockRes(); const next = mockNext();
  validateDisease(req, res, next);
  assert(!next.called, 'next() should NOT be called');
  assertEqual(res.statusCode, 400);
});

console.log('');

// ── 4. RBAC Middleware ─────────────────────────────────────────────────────
console.log('🔒 4. Role-Based Access Control');

const { protect, authorise } = require('../middleware/auth');

test('authorise allows matching role', () => {
  const req = mockReq({}, { id: 'u001', role: 'administrator' });
  const res = mockRes(); const next = mockNext();
  authorise('administrator')(req, res, next);
  assert(next.called, 'Administrator should be allowed');
});

test('authorise blocks non-matching role', () => {
  const req = mockReq({}, { id: 'u003', role: 'receptionist' });
  const res = mockRes(); const next = mockNext();
  authorise('administrator')(req, res, next);
  assert(!next.called, 'Receptionist should be blocked from admin-only route');
  assertEqual(res.statusCode, 403);
});

test('authorise allows multiple roles', () => {
  const req = mockReq({}, { id: 'u002', role: 'clinician' });
  const res = mockRes(); const next = mockNext();
  authorise('administrator', 'clinician')(req, res, next);
  assert(next.called, 'Clinician should be allowed when listed');
});

test('protect blocks request with no token', () => {
  const req = { headers: {} };
  const res = mockRes(); const next = mockNext();
  protect(req, res, next);
  assert(!next.called, 'No token should be blocked');
  assertEqual(res.statusCode, 401);
});

test('protect accepts a valid Bearer token', () => {
  const token = jwt.sign({ id: 'u001', role: 'administrator' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockRes(); const next = mockNext();
  protect(req, res, next);
  assert(next.called, 'Valid token should pass');
  assertEqual(req.user.id, 'u001');
});

test('protect rejects expired token', () => {
  const token = jwt.sign({ id: 'u001', role: 'administrator' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockRes(); const next = mockNext();
  protect(req, res, next);
  assert(!next.called, 'Expired token should be rejected');
  assertEqual(res.statusCode, 401);
});

console.log('');

// ── 5. Data Relationships ──────────────────────────────────────────────────
console.log('🔗 5. Data Relationship Integrity');

test('Every patient references an existing doctorId', () => {
  const patients = readAll('patients');
  const doctors = readAll('doctors');
  const doctorIds = doctors.map(d => d.id);
  patients.forEach(p => {
    assert(doctorIds.includes(p.doctorId), `Patient ${p.id} references missing doctorId ${p.doctorId}`);
  });
});

test('Every disease references an existing patientId', () => {
  const diseases = readAll('diseases');
  const patients = readAll('patients');
  const patientIds = patients.map(p => p.id);
  diseases.forEach(d => {
    assert(patientIds.includes(d.patientId), `Disease ${d.id} references missing patientId ${d.patientId}`);
  });
});

test('All doctors have required fields', () => {
  const doctors = readAll('doctors');
  doctors.forEach(d => {
    assert(d.id, `Doctor missing id`);
    assert(d.name, `Doctor ${d.id} missing name`);
    assert(d.specialty, `Doctor ${d.id} missing specialty`);
    assert(d.email, `Doctor ${d.id} missing email`);
  });
});

test('All patients have required fields', () => {
  const patients = readAll('patients');
  patients.forEach(p => {
    assert(p.id, 'Patient missing id');
    assert(p.firstName, `Patient ${p.id} missing firstName`);
    assert(p.lastName, `Patient ${p.id} missing lastName`);
    assert(p.dateOfBirth, `Patient ${p.id} missing dateOfBirth`);
    assert(p.doctorId, `Patient ${p.id} missing doctorId`);
  });
});

test('All diseases have required ICD code, name and severity', () => {
  const diseases = readAll('diseases');
  const validSeverities = ['mild', 'moderate', 'severe'];
  diseases.forEach(d => {
    assert(d.icdCode, `Disease ${d.id} missing icdCode`);
    assert(d.name, `Disease ${d.id} missing name`);
    assert(validSeverities.includes(d.severity), `Disease ${d.id} has invalid severity: ${d.severity}`);
  });
});

test('Patient p001 has at least 2 diagnoses (Hypertension + Diabetes)', () => {
  const diseases = findWhere('diseases', d => d.patientId === 'p001');
  assert(diseases.length >= 2, `Expected ≥2 diagnoses for p001, got ${diseases.length}`);
});

console.log('');

// ── 6. Dashboard Statistics ────────────────────────────────────────────────
console.log('📊 6. Dashboard Statistics Logic');

test('Totals are correct across all collections', () => {
  const doctors = readAll('doctors').filter(d => d.status === 'active');
  const patients = readAll('patients').filter(p => p.status === 'active');
  const diseases = readAll('diseases');
  assert(doctors.length === 5, `Expected 5 active doctors, got ${doctors.length}`);
  assert(patients.length === 6, `Expected 6 active patients, got ${patients.length}`);
  assert(diseases.length === 7, `Expected 7 diseases, got ${diseases.length}`);
});

test('Severity breakdown sums to total diagnoses', () => {
  const diseases = readAll('diseases');
  const mild = diseases.filter(d => d.severity === 'mild').length;
  const moderate = diseases.filter(d => d.severity === 'moderate').length;
  const severe = diseases.filter(d => d.severity === 'severe').length;
  assertEqual(mild + moderate + severe, diseases.length, 'Severity counts should sum to total');
});

test('Recent patients are sorted newest first', () => {
  const patients = readAll('patients');
  const sorted = [...patients].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
  const recent = sorted.slice(0, 5);
  assert(recent.length > 0, 'Should have recent patients');
  // Verify descending order
  for (let i = 0; i < recent.length - 1; i++) {
    const dateA = new Date(recent[i].registeredAt);
    const dateB = new Date(recent[i + 1].registeredAt);
    assert(dateA >= dateB, 'Dates should be in descending order');
  }
});

test('patientsBySpecialty groups correctly', () => {
  const patients = readAll('patients');
  const doctors = readAll('doctors');
  const specialtyMap = {};
  patients.forEach(p => {
    const doctor = doctors.find(d => d.id === p.doctorId);
    if (doctor) specialtyMap[doctor.specialty] = (specialtyMap[doctor.specialty] || 0) + 1;
  });
  const total = Object.values(specialtyMap).reduce((a, b) => a + b, 0);
  assertEqual(total, patients.length, 'Sum of specialty counts should equal total patients');
});

console.log('');

// ── 7. Edge Cases ──────────────────────────────────────────────────────────
console.log('⚠️  7. Edge Cases');

test('Empty string email is rejected by validateLogin', () => {
  const req = mockReq({ email: '', password: 'password123' });
  const res = mockRes(); const next = mockNext();
  validateLogin(req, res, next);
  assert(!next.called, 'Empty email should be rejected');
});

test('findById with undefined returns null gracefully', () => {
  const result = findById('doctors', undefined);
  assertEqual(result, null);
});

test('findWhere with predicate that matches nothing returns empty array', () => {
  const result = findWhere('doctors', () => false);
  assert(Array.isArray(result), 'Should return array');
  assertEqual(result.length, 0);
});

test('update on non-existent ID returns null', () => {
  const result = update('doctors', 'NONEXISTENT_999', { name: 'Ghost' });
  assertEqual(result, null, 'Should return null for missing ID');
});

test('JWT with missing user field still decodes payload', () => {
  const payload = { id: 'u999', role: 'administrator' };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assertEqual(decoded.id, 'u999');
  assert(!decoded.name, 'name field should be absent if not included');
});

console.log('');

// ── Results ────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log('══════════════════════════════════════');
console.log(`Results: ${passed}/${total} tests passed`);
if (failed > 0) {
  console.log(`❌ ${failed} test(s) FAILED`);
  process.exit(1);
} else {
  console.log('🎉 All tests passed!\n');
  process.exit(0);
}

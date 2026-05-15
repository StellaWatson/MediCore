/**
 * dashboardController.js
 * Provides aggregated statistics for the dashboard.
 */

const { readAll } = require('../utils/db');

/**
 * GET /api/dashboard/stats
 * Returns total counts, recent activity, and severity breakdown.
 */
const getStats = (req, res) => {
  try {
    const doctors = readAll('doctors');
    const patients = readAll('patients');
    const diseases = readAll('diseases');

    // Recent registrations (last 5 patients by registeredAt)
    const recentPatients = [...patients]
      .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
      .slice(0, 5)
      .map((p) => {
        const doctor = doctors.find((d) => d.id === p.doctorId);
        return { ...p, doctorName: doctor ? doctor.name : 'Unassigned' };
      });

    // Recent diagnoses (last 5)
    const recentDiseases = [...diseases]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((d) => {
        const patient = patients.find((p) => p.id === d.patientId);
        return { ...d, patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown' };
      });

    // Severity breakdown
    const severityBreakdown = {
      mild: diseases.filter((d) => d.severity === 'mild').length,
      moderate: diseases.filter((d) => d.severity === 'moderate').length,
      severe: diseases.filter((d) => d.severity === 'severe').length
    };

    // Status breakdown for diseases
    const diagnosisStatusBreakdown = {
      ongoing: diseases.filter((d) => d.status === 'ongoing').length,
      resolved: diseases.filter((d) => d.status === 'resolved').length,
      chronic: diseases.filter((d) => d.status === 'chronic').length
    };

    // Patients per specialty
    const specialtyMap = {};
    patients.forEach((p) => {
      const doctor = doctors.find((d) => d.id === p.doctorId);
      if (doctor) {
        specialtyMap[doctor.specialty] = (specialtyMap[doctor.specialty] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: {
        totals: {
          doctors: doctors.filter((d) => d.status === 'active').length,
          patients: patients.filter((p) => p.status === 'active').length,
          diagnoses: diseases.length
        },
        recentPatients,
        recentDiseases,
        severityBreakdown,
        diagnosisStatusBreakdown,
        patientsBySpecialty: specialtyMap
      }
    });
  } catch (err) {
    console.error('[DASHBOARD]', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard statistics.' });
  }
};

module.exports = { getStats };

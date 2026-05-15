# 🏥 CareTrack MRMS
**Medical Record Management System**  
*MediCore Solutions · CareTrack Clinic, Tashkent, Uzbekistan*

---

## Project Overview

CareTrack MRMS is a full-stack web application built for a Pearson BTEC Level 3 Higher National in Information Technologies (Unit 6: Full-Stack Development) assignment.

The system enables clinic staff at CareTrack Clinic to manage Doctor profiles, Patient records, and Disease/Diagnosis histories through a secure, role-controlled web interface — replacing paper-based and spreadsheet-driven workflows.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, React Router 6, Axios |
| Styling | Custom CSS, Bootstrap 5, Inter font |
| Backend | Node.js, Express.js 4 |
| Database | Local JSON files (Node.js `fs` module) |
| Authentication | JSON Web Tokens (JWT) |
| Security | bcrypt password hashing, RBAC middleware |
| Architecture | MVC pattern, RESTful API |

---

## Folder Structure

```
mrms/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       ← Login + JWT issuance
│   │   ├── doctorsController.js    ← Doctor CRUD
│   │   ├── patientsController.js   ← Patient CRUD
│   │   ├── diseasesController.js   ← Diagnosis CRUD
│   │   └── dashboardController.js  ← Statistics aggregation
│   ├── middleware/
│   │   ├── auth.js                 ← JWT protect + RBAC authorise
│   │   └── validate.js             ← Request body validation
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   ├── patients.js
│   │   ├── diseases.js
│   │   └── dashboard.js
│   ├── utils/
│   │   └── db.js                   ← JSON file read/write helper
│   ├── data/
│   │   ├── users.json              ← User accounts (hashed passwords)
│   │   ├── doctors.json            ← Doctor profiles
│   │   ├── patients.json           ← Patient records
│   │   └── diseases.json           ← Diagnosis records
│   ├── tests/
│   │   └── mrms.test.js            ← 45-test automated suite
│   ├── server.js                   ← Express app entry point
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Layout.js           ← Sidebar + topbar wrapper
        │   ├── Sidebar.js          ← Navigation sidebar
        │   └── ProtectedRoute.js   ← Auth/role guard for routes
        ├── context/
        │   └── AuthContext.js      ← Global auth state (login/logout)
        ├── pages/
        │   ├── LoginPage.js
        │   ├── Dashboard.js
        │   ├── DoctorsPage.js
        │   ├── PatientsPage.js
        │   ├── PatientProfilePage.js
        │   ├── DiseasesPage.js
        │   ├── AdminPage.js
        │   └── NotFoundPage.js
        ├── utils/
        │   └── api.js              ← Axios instance with JWT interceptor
        ├── App.js                  ← React Router config
        ├── index.js
        ├── index.css               ← Design system / global styles
        └── package.json
```

---

## Quick Start

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher

### 1. Clone / Extract the project
```bash
unzip mrms-caretrack.zip
cd mrms
```

### 2. Start the Backend
```bash
cd backend
npm install
node server.js
```
The API will run at: **http://localhost:5000**

### 3. Start the Frontend (new terminal)
```bash
cd frontend
npm install
npm start
```
The React app will run at: **http://localhost:3000**

---

## Demo Accounts

All demo accounts use the password: **`password`**

| Role | Email | Permissions |
|---|---|---|
| Administrator | admin@caretrack.uz | Full access — all CRUD, Admin Panel |
| Clinician | clinician@caretrack.uz | View all, update patients, create/update diagnoses |
| Receptionist | receptionist@caretrack.uz | Register patients, view doctors and patients |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Doctors
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/api/doctors` | All roles | List doctors (search, filter, paginate) |
| GET | `/api/doctors/:id` | All roles | Get doctor + patients |
| POST | `/api/doctors` | Administrator | Create doctor |
| PUT | `/api/doctors/:id` | Administrator | Update doctor |
| DELETE | `/api/doctors/:id` | Administrator | Delete doctor |

### Patients
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/api/patients` | All roles | List patients (search, filter, paginate) |
| GET | `/api/patients/:id` | All roles | Get full profile (doctor + diagnoses) |
| POST | `/api/patients` | Admin / Receptionist | Register patient |
| PUT | `/api/patients/:id` | Admin / Clinician | Update patient |
| DELETE | `/api/patients/:id` | Administrator | Delete patient + linked diagnoses |

### Diseases / Diagnoses
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/api/diseases` | All roles | List diagnoses (search, filter) |
| GET | `/api/diseases/:id` | All roles | Get single diagnosis |
| POST | `/api/diseases` | Admin / Clinician | Create diagnosis |
| PUT | `/api/diseases/:id` | Admin / Clinician | Update diagnosis |
| DELETE | `/api/diseases/:id` | Administrator | Delete diagnosis |

### Dashboard
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | All roles | Totals, recent records, severity breakdown |

---

## Database Structure

### JSON Relationships
```
Doctor (doctors.json)
  └── has many Patients  (patients.json → doctorId)
         └── has many Diseases  (diseases.json → patientId)
```

### doctors.json fields
`id, name, specialty, department, email, phone, licenseNumber, experience, status, createdAt, updatedAt`

### patients.json fields
`id, firstName, lastName, dateOfBirth, gender, bloodType, phone, email, address, emergencyContact, doctorId, status, registeredAt, updatedAt`

### diseases.json fields
`id, patientId, icdCode, name, description, severity, status, diagnosedDate, treatment, notes, createdAt, updatedAt`

### users.json fields
`id, name, email, password (bcrypt hash), role, createdAt, isActive`

---

## Running Tests

```bash
cd backend
node tests/mrms.test.js
```

The test suite covers 45 tests across 7 categories:
1. Database Utility (db.js)
2. Authentication (bcrypt + JWT)
3. Validation Middleware
4. Role-Based Access Control
5. Data Relationship Integrity
6. Dashboard Statistics Logic
7. Edge Cases

---

## Security Features

- **JWT Authentication** — 8-hour expiry, signed with secret from `.env`
- **bcrypt Password Hashing** — salt rounds = 10
- **RBAC Middleware** — every route checks role before processing
- **Validation Middleware** — all inputs validated before controllers run
- **CORS** — restricted to `http://localhost:3000`
- **No sensitive data in responses** — passwords never returned by API
- **Cascade delete** — deleting a patient removes all linked diagnoses

---

## Future Improvements

1. **Real database** — Migrate from JSON files to PostgreSQL or MongoDB for concurrent access
2. **Appointment scheduling** — Add calendar and booking system
3. **File attachments** — Allow uploading X-rays and lab reports (PDF/image)
4. **Audit logging** — Record who changed what and when
5. **Email notifications** — Alert patients and doctors on new diagnoses
6. **Two-factor authentication** — Add OTP via SMS for clinical staff
7. **Export to PDF** — Print patient profiles and reports
8. **Pagination UI** — Add page controls to all list views
9. **Dark mode** — Reduce eye strain for night-shift staff

---

## Deployment Notes

1. Set `NODE_ENV=production` and generate a strong `JWT_SECRET` in `.env`
2. Run `npm run build` in `frontend/` to create a production bundle
3. Serve the React build folder statically from Express using `express.static`
4. Use **PM2** (`pm2 start server.js`) to keep the Node.js process alive
5. Add **Nginx** as a reverse proxy on port 80/443 with SSL (Let's Encrypt)
6. Back up the `data/` JSON folder regularly — it is the entire database

---

*Built by Abduazimova Hosila · Student ID: 250012 · Group: 25-101*  
*Pearson BTEC Level 3 HN in Information Technologies · Unit 6: Full-Stack Development*  
*Submission: January 2026*

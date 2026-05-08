# 🌐 API Routes & Controllers

This document maps the RESTful API structure to their respective controllers. 

> [!TIP]
> Keep controllers thin; delegate complex logic to services to maintain a clean separation of concerns.

| HTTP Method | Route Endpoint | Controller Function | Purpose |
| :--- | :--- | :--- | :--- |
| **Auth Routes** | `(/api/v1/auth)` | | |
| `POST` | `/register` | `registerUser` | Create new patient/doctor account. |
| `POST` | `/login` | `loginUser` | Authenticate and return JWT. |
| `POST` | `/refresh` | `refreshToken` | Refresh JWT using http-only cookie. |
| `POST` | `/logout` | `logoutUser` | Invalidate token and logout user. |
| **User Profile** | `(/api/v1/users)` | | |
| `PUT` | `/profile` | `updateProfile` | Update user details, health info. |
| **AI Scribe** | `(/api/v1/scribe)` | | |
| `POST` | `/upload-audio` | `processVisitAudio` | Upload ambient audio, return SOAP note. |
| `GET` | `/visits/:patientId` | `getPatientVisits` | Fetch past visit notes for context. |
| `DELETE` | `/visits/:id` | `deleteVisit` | Soft delete/archive a visit. |
| **Vitals & Labs** | `(/api/v1/vitals)` | | |
| `POST` | `/record` | `addVitals` | Add new heart rate or lab result. |
| `GET` | `/:patientId/history` | `getVitalsHistory` | Fetch vitals over time for graphing. |
| **AI Companion** | `(/api/v1/chat)` | | |
| `POST` | `/ask` | `askHealthCompanion` | AI responds using patient context. |
| `POST` | `/explain-term` | `explainMedicalTerm` | "Tap-to-Explain" for complex terms. |
| **Appointments** | `(/api/v1/appointments)` | | |
| `POST` | `/` | `scheduleAppointment` | Schedule a new visit. |
| `GET` | `/` | `getAppointments` | Fetch doctor/patient schedule. |
| **Prescriptions** | `(/api/v1/prescriptions)` | | |
| `POST` | `/` | `createPrescription` | Issue a new medication. |
| `GET` | `/:patientId` | `getPrescriptions` | Manage and retrieve patient meds. |
| **Notifications** | `(/api/v1/notifications)` | | |
| `GET` | `/` | `getNotifications` | Fetch unread alerts. |
| `PUT` | `/:id/read` | `markAsRead` | Update notification status. |
| **Admin** | `(/api/v1/admin)` | | |
| `GET` | `/users` | `getAllUsers` | Admin dashboard data retrieval. |
| `GET` | `/audit-logs` | `getAuditLogs` | Fetch system audit trails. |

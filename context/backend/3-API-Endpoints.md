# 🌐 API Routes & Controllers

This document maps the RESTful API structure to their respective controllers. 

> [!TIP]
> Keep controllers thin; delegate complex logic to services to maintain a clean separation of concerns.

| HTTP Method | Route Endpoint | Controller Function | Purpose |
| :--- | :--- | :--- | :--- |
| **Auth Routes** | `(/api/auth)` | | |
| `POST` | `/register` | `registerUser` | Create new patient/doctor account. |
| `POST` | `/login` | `loginUser` | Authenticate and return JWT. |
| **AI Scribe** | `(/api/scribe)` | | |
| `POST` | `/upload-audio` | `processVisitAudio` | Upload ambient audio, return SOAP note. |
| `GET` | `/visits/:patientId` | `getPatientVisits` | Fetch past visit notes for context. |
| **Vitals & Labs** | `(/api/vitals)` | | |
| `POST` | `/record` | `addVitals` | Add new heart rate or lab result. |
| `GET` | `/:patientId/history` | `getVitalsHistory` | Fetch vitals over time for graphing. |
| **AI Companion** | `(/api/chat)` | | |
| `POST` | `/ask` | `askHealthCompanion` | AI responds using patient context. |
| `POST` | `/explain-term` | `explainMedicalTerm` | "Tap-to-Explain" for complex terms. |

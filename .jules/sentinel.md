## 2025-02-14 - Fix IDOR in PreVisitBrief endpoint
**Vulnerability:** The `getPreVisitBrief` endpoint in `backend/src/controllers/appointmentController.js` accepted a `patientId` query parameter without checking if the requesting doctor was authorized to view that patient's data, leading to an Insecure Direct Object Reference (IDOR).
**Learning:** This existed because the controller was trusting user input (`req.query.patientId`) for data access instead of verifying authorization against the appointment (`req.params.id`).
**Prevention:** Always fetch the primary resource (e.g., appointment) from the database, verify ownership/access (`appointment.doctorId === req.user.id`), and use the trusted relationship data (`appointment.patientId`) instead of raw user input from queries or payloads.

# 🔒 Security Architecture

## 1. Authentication Flow & Hashing
- **Password Hashing**: All user passwords are encrypted using `bcrypt` (salt rounds: 10) before storage. Plaintext passwords never touch the database.
- **JWT Refresh Token Strategy**: 
  - Access Tokens (short-lived, ~15 minutes) are sent to the client.
  - Refresh Tokens (long-lived, ~7 days) are stored in highly secure, **HTTP-only, SameSite=Strict cookies** to mitigate XSS (Cross-Site Scripting) attacks.

## 2. Role-Based Access Control (RBAC)
Strict separation of concerns via `roleMiddleware.js`:
- **PATIENT**: Can view their own records, book appointments, and chat with AI.
- **DOCTOR**: Can view assigned patient profiles, edit SOAP notes, and prescribe medications.
- **ADMIN**: Access to system-wide logs, user management, and aggregate analytics.

## 3. Encryption & Privacy Handling
- **Data at Rest**: Leveraging NeonDB's underlying AES-256 encryption for data at rest.
- **Data in Transit**: Forced HTTPS/TLS 1.3 for all client-server and server-database communications.

## 4. HIPAA-Inspired Compliance Notes
While fully certifying for HIPAA requires extensive auditing, the architecture follows core principles:
- **Audit Logging**: Every sensitive action (viewing a record, editing a note) is captured in the `AuditLog` table.
- **Soft Deletes**: Records are never permanently `DELETE`d; instead, a `deletedAt` timestamp is set to maintain historical integrity.
- **Minimal Exposure**: APIs strictly return only the fields necessary for the view (e.g., stripping password hashes from user objects).

# 🏗️ Backend Architecture Overview (PERN Stack)

This document outlines the folder structure, data flow, and core infrastructure for the PERN backend (PostgreSQL, Express, React, Node), utilizing NeonDB and Prisma ORM for the AI healthcare app.

## 📂 Folder Structure

```text
backend/
├── validations/      # Zod/Joi schema validation for API request payloads
├── prisma/           # Prisma client setup and database models
│   └── schema.prisma # Single source of truth for DB models
├── tests/            # API & service testing (auth tests, route tests, AI tests)
├── constants/        # Enums, fixed strings, and application-wide constants
├── src/
│   ├── config/         # Environment variables & AI API configurations
│   ├── controllers/    # Handles incoming HTTP requests & responses
│   ├── middlewares/    # Custom logic (Auth, Rate Limiting, Error Handling)
│   ├── routes/         # Express API route definitions & groupings
│   ├── services/       # Core Business & AI Logic (Separation of concerns)
│   └── utils/          # Helper functions (Loggers, formatting)
├── .env                # Secret keys (JWT, DB URI, AI API Keys)
└── server.js           # Entry point of the application
```

## 🔄 Program Flow (The Request Lifecycle)

1.  **Client Request**: Frontend sends an audio file, text prompt, or CRUD request.
2.  **Route (`routes/`)**: Receives the request (e.g., `/api/v1/ai/scribe`).
3.  **Middleware (`middlewares/`)**: Verifies JWT (Authentication), checks RBAC (Authorization), enforces Rate Limits, and parses files (Multer).
4.  **Validation (`validations/`)**: Payload is validated against Zod schemas.
5.  **Controller (`controllers/`)**: Takes the validated payload and passes data to the service.
6.  **Service (`services/`)**:
    *   Executes core logic (e.g., sends audio to Whisper API).
    *   Interacts with LLMs.
7.  **Database (`prisma/`)**: Service uses Prisma Client to persist data or fetch context from NeonDB.
8.  **Response**: Controller sends a JSON response back to the client.

## 🏗️ Infrastructure Architecture

### File Storage Strategy
* **Audio & Document Storage**: We utilize **Supabase Storage** or **Cloudinary** for highly secure, HIPAA-compliant storage of ambient session recordings. The database only stores the URL (`audioUrl`), not the actual audio blobs.
* **Image Storage**: Cloudinary is used for avatar images and non-sensitive media.

### Logging System
* **Request Logger**: Uses `utils/logger.js` integrating `winston` (or `pino`) for robust request logs, error logs, and AI failure logs.
* **Audit Logging**: Specific database triggers and a dedicated `AuditLog` table track sensitive mutations.

### Error Response Standardization
All APIs return a unified response structure to ensure the frontend can predictably handle errors.
```json
{
  "success": false,
  "message": "Unauthorized",
  "errorCode": "AUTH_401"
}
```

### Rate Limiting & Validation
* **Rate Limiting**: Implemented via `express-rate-limit` to restrict requests per IP and prevent abuse of expensive AI APIs.
* **Validation Layer**: All incoming data is rigorously validated using **Zod** or **Joi** schemas in the `validations/` folder before reaching controllers.
* **Environment Config Validation**: We validate `.env` secrets (API keys, DB URLs) at startup to prevent silent failures.

### Database Migration Strategy
* We rely on **Prisma Migrations** (`npx prisma migrate dev`) for safe schema evolution and version control of database changes over time.

### API Versioning
* All RESTful endpoints are prefixed with `/api/v1/` to ensure future backward compatibility.

### Background Jobs & Queue Architecture
* A task queue is used for scheduled reminders, async processing, and handling heavy AI tasks without blocking the main event loop.

### Security Architecture
* **Authentication**: Short-lived JWTs combined with HTTP-only, secure cookies for refresh tokens.
* **Authorization**: Strict Role-Based Access Control (RBAC) separating PATIENT, DOCTOR, and ADMIN privileges.
* **Data Privacy**: Passwords hashed with `bcrypt`, sensitive PII encrypted at rest, aligning with HIPAA compliance principles.
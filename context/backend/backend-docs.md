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
    *   Executes core logic (e.g., sends audio to Gemini/Groq API for STT).
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

---

# 🧠 Architecture Reasoning (The "Why")

This document explains the rationale behind the technical decisions made for the CareSync backend. While other documents describe *what* the system does, this document explains *why* the architecture exists in its current form.

## 1. Scalability Reasoning

### Why separate Services from Controllers?
Controllers are kept extremely thin, strictly handling HTTP requests and responses. The actual business logic (e.g., calling DeepSeek, processing SOAP notes) is abstracted into **Services**. 
* **Reason**: This allows the same logic to be reused in different contexts. For example, if we introduce a GraphQL API or a background job (n8n worker) later, they can call `aiService.generateSOAP()` directly without needing to mock an Express request object.

### Why use an abstraction layer for AI Providers?
* **Reason**: The AI landscape changes rapidly. By abstracting the AI calls behind `aiService.js`, we prevent vendor lock-in. If DeepSeek becomes rate-limited, we can instantly swap to GLM-5.1 or Google Gemini with minimal code changes.

### Why move Chat Memory to a separate `ChatMessage` table?
Initially, chat memory was stored as a JSON array (`messages Json`). This was refactored into a `ChatMessage` table.
* **Reason**: JSON arrays become heavily bloated over time. Fetching a massive JSON object for every chat request consumes excessive memory and prevents efficient pagination. A separate table allows us to paginate history (e.g., `limit 20 offset 40`) and query specific messages, significantly improving long-term scalability.

## 2. Database Reasoning

### Why is `Doctor` explicitly linked to `Visit` and `Patient`?
* **Reason**: In an enterprise healthcare system, ownership is critical. A patient might see multiple doctors within the same clinic. If a `Visit` is only linked to the patient, it becomes impossible to run analytics on doctor performance, filter visits by provider, or enforce RBAC (ensuring a doctor only sees visits *they* conducted).

### Why use Soft Deletes (`deletedAt`) instead of hard deletes?
* **Reason**: Healthcare regulations (like HIPAA) often require strict data retention policies. A hard delete (`DELETE FROM "User"`) permanently removes data, making it impossible to investigate past medical errors or audit logs. Soft deletes maintain referential integrity while hiding the data from the application layer.

### Why extract `Prescription` into its own table?
* **Reason**: Medications should *never* exist purely as plain text inside a SOAP note. By moving prescriptions to a dedicated table linked to a `Visit`, we unlock powerful features: programmatic refill tracking, medication adherence reminders (via n8n), and automated drug-interaction checks in the future.

## 3. Workflow & Automation Reasoning

### Why use n8n for Background Tasks instead of raw Node.js cron jobs?
* **Reason**: Healthcare workflows are highly event-driven (e.g., sending an SMS 24 hours before an appointment, or a daily medication reminder). Writing and managing these complex temporal workflows in pure Node.js introduces heavy technical debt and makes visual debugging difficult. n8n provides a visual canvas, retry logic, and seamless integration with external providers (Twilio/SendGrid), decoupling workflow logic from the core API.

### Why enforce a strict Validation Layer (Zod/Joi)?
* **Reason**: Medical data must be immaculate. Relying on frontend validation or controller-level `if` statements is unsafe. A dedicated validation layer ensures that missing required fields (like a patient's `bloodGroup` or `allergen`) are caught at the boundary of the application, guaranteeing database integrity and preventing corrupted AI prompts.

## 4. Security & Compliance Reasoning

### Why use an `AuditLog` table?
* **Reason**: In clinical systems, "who did what and when" is legally binding. If a prescription's dosage is changed, the system must record the exact `userId`, the `entityId` changed, and the precise metadata of the modification. This provides accountability and satisfies basic enterprise security audits.


---

# 📊 Architecture Diagrams

## 1. System Architecture Diagram
```mermaid
graph TD
    Client[React Client] --> API[Node.js / Express API]
    API --> Middleware[Auth/Rate Limit]
    Middleware --> Controllers
    Controllers --> Services
    
    Services --> DB[(NeonDB PostgreSQL)]
    Services --> Storage[Supabase / Cloudinary]
    Services --> AI[AI Providers: Gemini/DeepSeek]
    Services --> n8n[n8n Automation Engine]
    
    n8n --> ThirdParty[Twilio/SendGrid]
```

## 2. Request Lifecycle Diagram (AI Scribe)
```mermaid
sequenceDiagram
    participant Doctor
    participant Client
    participant API
    participant AI
    participant DB

    Doctor->>Client: Records Ambient Audio
    Client->>API: POST /api/v1/scribe/upload-audio
    API->>API: Verify JWT & Parse Audio
    API->>AI: Send to Gemini Flash (Transcribe)
    AI-->>API: Raw Transcript
    API->>AI: Send to DeepSeek (Generate SOAP)
    AI-->>API: Structured SOAP JSON
    API->>DB: Save Visit & Note
    DB-->>API: Success
    API-->>Client: 200 OK + Note Data
```

## 3. Entity Relationship Diagram (ERD) Overview
```mermaid
erDiagram
    USER ||--o{ VISIT : "patient/doctor"
    USER ||--o{ PRESCRIPTION : "patient/doctor"
    USER ||--o{ APPOINTMENT : "patient/doctor"
    USER ||--o{ VITAL : "has"
    USER ||--o{ ALLERGY : "has"
    USER ||--o{ NOTIFICATION : "receives"
    
    VISIT {
        string rawTranscript
        string subjective
        string objective
    }
    
    PRESCRIPTION {
        string medication
        string dosage
    }
```

## 4. n8n Workflow Flowchart (Appointment Reminder)
```mermaid
graph LR
    Trigger[Cron: Every Hour] --> QueryDB[Query DB for Appts in 24h]
    QueryDB --> Loop[For Each Appt]
    Loop --> CheckPref[Check User Notification Prefs]
    CheckPref -->|SMS| Twilio[Send Twilio SMS]
    CheckPref -->|Email| SendGrid[SendGrid Email]
```

## 5. AI Processing Flow
```mermaid
graph TD
    Input[Raw Transcript + Patient Context] --> Validator[Data Sanitization]
    Validator --> PromptBuilder[Inject into Clinical Prompt]
    PromptBuilder --> PrimaryLLM[Primary LLM: OpenAI]
    
    PrimaryLLM -- Success --> OutputParser[Zod Schema Validation]
    PrimaryLLM -- Failure / Timeout --> FallbackLLM[Fallback LLM: GLM-5.1]
    
    FallbackLLM --> OutputParser
    
    OutputParser -- Valid --> Save[Persist to DB]
    OutputParser -- Invalid --> Retry[Self-Correction Prompt]
```


---

# 🗄️ Database Models (NeonDB + Prisma ORM)

Since we are using NeonDB (Serverless PostgreSQL), we utilize Prisma ORM. The data is structured into strict relational tables inside the `prisma/schema.prisma` file.

## 1. User Table (Patients, Doctors, Admins)
Handles user accounts, authentication, and specialized health data for patients.

```prisma
model User {
  id               String    @id @default(uuid())
  email            String    @unique
  passwordHash     String
  role             Role      // Enum: PATIENT, DOCTOR, ADMIN
  name             String
  dateOfBirth      DateTime?
  
  // Healthcare-Specific Data (Primarily for Patients)
  bloodGroup       String?
  medicalHistory   String[]  // Array of chronic diseases / past conditions
  insuranceInfo    Json?     // Insurance provider, policy number, etc.
  familyHistory    Json?     // Family medical history
  
  // Relations
  patientVisits    Visit[]       @relation("PatientVisits")
  doctorVisits     Visit[]       @relation("DoctorVisits")
  vitals           Vital[]
  chats            Chat[]
  prescriptions    Prescription[] @relation("PatientPrescriptions")
  doctorPrescripts Prescription[] @relation("DoctorPrescriptions")
  appointments     Appointment[] @relation("PatientAppointments")
  doctorAppts      Appointment[] @relation("DoctorAppointments")
  allergies        Allergy[]
  emergencyContacts EmergencyContact[]
  notifications    Notification[]

  // Doctor-Patient Ownership (Multi-doctor support)
  doctors          User[]  @relation("DoctorPatient")
  patients         User[]  @relation("DoctorPatient")

  // Soft deletes
  deletedAt        DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@index([email])
  @@index([role])
}

enum Role {
  PATIENT
  DOCTOR
  ADMIN
}
```

## 2. Visit Table (SOAP Notes)
Stores ambient recordings and structured AI outputs linked to a specific patient and doctor.

```prisma
model Visit {
  id        String @id @default(uuid())
  patientId String
  patient   User   @relation("PatientVisits", fields: [patientId], references: [id])
  doctorId  String
  doctor    User   @relation("DoctorVisits", fields: [doctorId], references: [id])

  audioUrl      String? // Cloudinary/Supabase URL
  rawTranscript String

  // SOAP Note Fields
  subjective String?
  objective  String?
  assessment String?
  plan       String?

  medicalTerms Json? // e.g., [{"term": "Tachycardia", "meaning": "Fast heart rate"}]

  prescriptions Prescription[]

  deletedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([patientId])
  @@index([doctorId])
}
```

## 3. Clinical Data Models
Tracks vitals, allergies, and emergency contacts.

```prisma
model Vital {
  id        String @id @default(uuid())
  patientId String
  patient   User   @relation(fields: [patientId], references: [id])

  heartRate     Int?
  bloodPressure String?
  weight        Float?
  temperature   Float?
  labResults    Json? // e.g., [{"test": "HbA1c", "value": "5.7", "unit": "%"}]

  recordedAt DateTime @default(now())
  
  @@index([patientId])
}

model Allergy {
  id          String @id @default(uuid())
  patientId   String
  patient     User   @relation(fields: [patientId], references: [id])
  allergen    String
  severity    String // MILD, MODERATE, SEVERE
  reaction    String?
  
  createdAt   DateTime @default(now())
}

model EmergencyContact {
  id           String @id @default(uuid())
  patientId    String
  patient      User   @relation(fields: [patientId], references: [id])
  name         String
  relationship String
  phoneNumber  String
}
```

## 4. Appointments & Prescriptions
Handles scheduling and medication management.

```prisma
model Appointment {
  id          String   @id @default(uuid())
  patientId   String
  patient     User     @relation("PatientAppointments", fields: [patientId], references: [id])
  doctorId    String
  doctor      User     @relation("DoctorAppointments", fields: [doctorId], references: [id])
  
  scheduledAt DateTime
  status      AppointmentStatus
  reason      String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([doctorId, scheduledAt])
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

model Prescription {
  id            String   @id @default(uuid())
  patientId     String
  patient       User     @relation("PatientPrescriptions", fields: [patientId], references: [id])
  doctorId      String
  doctor        User     @relation("DoctorPrescriptions", fields: [doctorId], references: [id])
  visitId       String
  visit         Visit    @relation(fields: [visitId], references: [id])
  
  medicineName  String
  dosage        String
  frequency     String
  duration      String
  notes         String?
  
  simplifiedInstructions String? // AI generated patient-friendly instructions
  voiceInstructionUrl    String? // TTS generated audio guidance

  medSchedules  MedicationSchedule[]
  
  createdAt     DateTime @default(now())
}

model MedicationSchedule {
  id             String @id @default(uuid())
  prescriptionId String
  prescription   Prescription @relation(fields: [prescriptionId], references: [id])

  reminderTime   DateTime
  isTaken        Boolean @default(false)
}
```

## 5. System Models (Auditing, Notifications, Chat)

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  userId      String?  
  action      String   // e.g., "UPDATE_PRESCRIPTION", "DELETE_VISIT"
  entityType  String   // e.g., "Visit", "User"
  entityId    String
  metadata    Json?    // Changes made
  createdAt   DateTime @default(now())
  
  @@index([entityType, entityId])
}

model Notification {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String
  title       String
  message     String
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Chat {
  id        String @id @default(uuid())
  patientId String
  patient   User   @relation(fields: [patientId], references: [id])

  messages  ChatMessage[]

  updatedAt DateTime @updatedAt
}

model ChatMessage {
  id        String @id @default(uuid())
  chatId    String
  chat      Chat   @relation(fields: [chatId], references: [id])
  role      String
  content   String

  createdAt DateTime @default(now())
}
```

## 🚀 Advanced PostgreSQL Features

* **Indexes**: Added Prisma `@@index` annotations on heavily queried fields (e.g., `email`, `patientId`, `doctorId`, `role`, `createdAt`) to optimize lookup performance.
* **Soft Deletes (`deletedAt`)**: Implemented on `User` and `Visit` tables to retain historical data for HIPAA compliance without permanently removing records.
* **Full-Text Search Strategy**: PostgreSQL `to_tsvector` and `to_tsquery` functions will be used for searching across `Visit.rawTranscript` and `Visit.subjective/objective` fields, enabling fast keyword lookups in clinical notes.
* **Materialized Views**: Used for generating monthly analytical dashboards for doctors (e.g., aggregating patient visit counts and common diagnoses) to reduce query load on the primary tables.
* **Trigger Documentation**: PostgreSQL triggers handle automatic insertion into `AuditLog` when sensitive tables (like `Prescription` or `Visit`) are modified or deleted.


---

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


---

# ⚙️ Services & Middlewares

Separating this from controllers makes your code clean, modular, and reusable. This layer handles the "how" of your application's logic.

## 🛡️ Middlewares
These act as gatekeepers or pre-processors for your routes.

1.  **`authMiddleware.js`**: 🔑 Verifies `Authorization` header for valid JWT. Ensures strict data privacy.
2.  **`roleMiddleware.js`**: 🛡️ Enforces Role-Based Access Control (RBAC). For example, ensuring only doctors can write prescriptions.
3.  **`rateLimiter.js`**: ⏱️ Throttles requests per IP to prevent brute-force attacks and abuse.
4.  **`requestLogger.js`**: 📜 Logs incoming request metadata (IP, endpoint, user agent) to `winston` for monitoring.
5.  **`validationMiddleware.js`**: 🧪 Validates incoming `req.body` against Zod schemas before hitting the controller.
6.  **`uploadMiddleware.js`**: 📁 Uses `Multer` to handle ambient audio file uploads from the client.
7.  **`errorHandler.js`**: 🚨 Global try-catch wrapper to handle database or AI API timeouts gracefully.

## 🧠 Services (The Heavy Lifting)
Core business logic and external API integrations.

### 1. `aiService.js` (Intelligence)
- **Primary Task**: Interfacing with budget-friendly/free LLMs (DeepSeek, GLM-5.1, or Gemini).
- **`generateSOAP(transcript)`**: Prompts AI to extract **Subjective, Objective, Assessment, and Plan**.
- **`chatWithContext(patientId, query)`**: Fetches DB history via Prisma, feeds it to the AI for a tailored response.

### 2. `audioService.js` (Transcription)
- **Primary Task**: Connects to external Audio-to-Text free-tier Audio-to-Text APIs (e.g., Google Gemini Flash or Groq Whisper).

### 3. `prescriptionService.js` (Medication Management)
- **Primary Task**: Handles creation of prescriptions, validates drug interactions (future scope), and syncs with scheduling.

### 4. `appointmentService.js` (Scheduling)
- **Primary Task**: Manages booking logic, prevents double-booking for doctors, and triggers reminder workflows.

### 5. `notificationService.js` (Alerts)
- **Primary Task**: Centralized service to dispatch in-app notifications, SMS, or email alerts via n8n or external providers.

### 6. `storageService.js` (File Handling)
- **Primary Task**: Uploads raw audio files or user avatars to Supabase Storage/Cloudinary and returns secure URLs.

### 7. `auditService.js` (Compliance)
- **Primary Task**: Inserts records into the `AuditLog` table whenever sensitive operations (create, update, delete) occur on patient records.

### 8. `dbService.js` (Persistence)
- **Primary Task**: Optional wrapper for Prisma Client calls to ensure controllers don't interface with the database directly.


---

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


---

# 🤖 AI Architecture Documentation

## 1. Provider Abstraction & Recommendations
CareSync utilizes an abstraction layer (`aiService.js`) to prevent vendor lock-in. Our recommended stack for the MVP is:

*   **Speech-to-Text (STT)**: **Google Gemini 1.5 Flash (Free Tier)** (Best free multi-modal API for medical terminology). *Alternatives: Groq Whisper (Free API limit)*.
*   **LLM (AI Brain)**: **DeepSeek (v4/v3/R1)** (Extremely cost-effective, high reasoning power). *Alternatives: GLM-5.1 (Zhipu AI), Google Gemini (Free Tier)*.
*   **Text-to-Speech (TTS) (Optional)**: **Edge TTS / Google Cloud TTS** (Completely free/generous free tier alternatives).

## 2. AI Responsibilities & Limitations
The AI acts strictly as an assistant and scribe.

✅ **The AI SHOULD:**
*   Generate structured SOAP notes from raw audio transcripts.
*   Simplify complex medical terminology into patient-friendly language.
*   Clearly explain medicine timings and dosages.
*   Provide precautions and general follow-up guidance based on the doctor's notes.

❌ **The AI SHOULD NOT:**
*   Diagnose patients independently.
*   Prescribe medication independently.
*   Replace or override explicit doctor decisions.

## 3. Prompt Engineering Structure
We use structured, role-based prompting tailored for clinical use:
*   **System Prompt**: Enforces clinical tone, HIPAA constraints, and JSON output structures.
*   **Context Injection**: Patient vitals, medical history, and allergies are serialized and injected into the prompt dynamically.
*   **Task Prompt**: Specific instructions (e.g., "Extract SOAP components and generate simplified patient guidance from this transcript").

## 4. Fallback & Error Recovery
*   **Provider Fallback**: If the primary AI provider (e.g., DeepSeek) experiences downtime, `aiService` falls back to a secondary provider (e.g., GLM-5.1/Gemini).
*   **Timeout Handling**: Built-in retry logic with exponential backoff for network errors.
*   **Token Limits**: Chunking strategies for extremely long transcripts.

## 5. AI Response Validation
Responses from the LLM are strictly validated using **Zod**. If the AI returns malformed JSON or hallucinates required schema fields, the system automatically triggers a localized retry asking the AI to correct the format before returning an error.


---

# 🌟 AI Prescription Guidance & Medical Scribe Feature

## 📌 Feature Overview
This feature transforms doctor-patient conversations or manually entered prescriptions into highly understandable patient guidance using AI. It directly solves critical healthcare issues such as unreadable doctor handwriting, forgotten medicine timings, confusing medical terminology, and lost post-visit instructions.

## 🎯 Core Goals
*   **Improve patient understanding** by digitizing prescription guidance.
*   **Reduce medicine misuse** through simplified, clear instructions.
*   **Provide multilingual/voice explanations** for lower-literacy or elderly patients.
*   **Automate reminders and follow-ups** via n8n.

## 🧠 Supported Workflows

### Workflow 1 — Manual Doctor Entry
1. Doctor enters medicines + notes manually into the frontend.
2. Backend receives the structured prescription.
3. AI generates simplified patient guidance (precautions, timings).
4. Data is stored in PostgreSQL (NeonDB).
5. Patient receives text instructions, scheduled reminders, and optional voice guidance.

### Workflow 2 — AI Medical Scribe (Conversation Recording)
1. Doctor starts recording the conversation via browser microphone (`react-media-recorder`).
2. Audio is uploaded to the Express backend via `multer`.
3. **Speech-to-Text AI (Gemini Flash)** transcribes the conversation.
4. **LLM (DeepSeek/GLM-5.1)** analyzes the transcript to generate SOAP notes, a medicine list, precautions, and simplified patient guidance.
5. Data is saved to PostgreSQL.
6. **n8n Automation** triggers scheduled reminders and notifications.

## 🏗️ Technical Architecture & MVP Scope

### 📡 Network Layer (REST vs WebSockets)
**MVP Recommendation: NO WEBSOCKETS.**
*   Use standard REST APIs (e.g., `axios`) for audio upload -> processing -> response.
*   *Reason*: Faster development, less complexity.
*   *Future Scope*: Use `socket.io` only later for live transcript streaming or real-time AI note generation dashboards.

### 🧩 Technologies
*   **Frontend**: React.js / Next.js with `react-media-recorder` (or `mic-recorder-to-mp3`).
*   **Backend**: Node.js, Express.js, `multer` for audio file uploads.
*   **Database**: PostgreSQL (NeonDB) with Prisma ORM.

### 🚀 MVP Rollout Plan
**Build THIS First:**
✅ Doctor login & Auth
✅ Audio upload API
✅ Free STT (Gemini Flash) transcription integration
✅ AI SOAP generation & Medicine guidance
✅ Save structured data into PostgreSQL
✅ Return patient summary response

**Add Later:**
❌ Live streaming (WebSockets)
❌ Real-time AI processing
❌ Complex autonomous voice agents
❌ Multi-language TTS
❌ OCR handwriting parsing

## ✅ Final Summary
This feature—**AI-generated understandable patient guidance derived from real doctor conversations**—is the strongest value proposition of CareSync. It is practical, modern, technically impressive, and highly relevant for solving real-world healthcare accessibility issues.


---

# ⚡ n8n Automation Architecture

While the core Node.js backend handles direct API requests, **n8n** is used to orchestrate complex, event-driven, and scheduled background tasks.

## 🚫 What n8n Should NOT Handle
To maintain system integrity, n8n is strictly excluded from:
*   Frontend rendering or audio recording.
*   User authentication & JWT generation.
*   Main backend REST APIs (like saving SOAP notes directly).

## ✅ Recommended n8n Workflows

### Workflow 1 — Patient Guidance Automation
*   **Trigger**: Webhook from Backend (Visit created).
*   **Action**: AI generates simplified guidance (if not already done synchronously) -> Stores guidance in DB -> Sends push/email notification to the patient with their simplified instructions.

### Workflow 2 — Medicine Reminder System
*   **Trigger**: Cron job runs every hour.
*   **Action**: Queries the `MedicationSchedule` table for upcoming timings -> Dispatches SMS (Twilio), WhatsApp, Email (SendGrid), or Push Notifications to patients.

### Workflow 3 — Voice Instruction Generation
*   **Trigger**: Webhook from Backend (Prescription saved).
*   **Action**: Triggers TTS API (Edge TTS / Google Free Tier) to read the simplified instructions -> Uploads generated audio to Supabase/Cloudinary -> Stores the audio URL (`voiceInstructionUrl`) back in the database.

### Workflow 4 — Follow-Up Reminder
*   **Trigger**: Webhook from Backend (Visit completed).
*   **Action**: Schedules a delayed temporal task (e.g., wait 7 days) -> Notifies patient to book a follow-up appointment or check their vitals.

### Workflow 5 — Critical Health Alerts
*   **Trigger**: Webhook from Backend (Abnormal vitals logged).
*   **Action**: Immediately triggers an urgent push notification and SMS to the assigned doctor.


---


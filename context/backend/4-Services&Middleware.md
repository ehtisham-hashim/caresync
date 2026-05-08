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
- **Primary Task**: Interfacing with LLMs (Claude, Gemini, or OpenAI).
- **`generateSOAP(transcript)`**: Prompts AI to extract **Subjective, Objective, Assessment, and Plan**.
- **`chatWithContext(patientId, query)`**: Fetches DB history via Prisma, feeds it to the AI for a tailored response.

### 2. `audioService.js` (Transcription)
- **Primary Task**: Connects to external Audio-to-Text APIs (e.g., OpenAI Whisper).

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

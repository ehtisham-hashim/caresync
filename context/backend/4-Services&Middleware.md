# ⚙️ Services & Middlewares

Separating this from controllers makes your code clean, modular, and reusable. This layer handles the "how" of your application's logic.

## 🛡️ Middlewares
These act as gatekeepers or pre-processors for your routes.

1.  **`authMiddleware.js`**: 🔑 Verifies `Authorization` header for valid JWT. Ensures strict data privacy.
2.  **`uploadMiddleware.js`**: 📁 Uses `Multer` to handle ambient audio file uploads from the client.
3.  **`errorHandler.js`**: 🚨 Global try-catch wrapper to handle database or AI API timeouts gracefully.

## 🧠 Services (The Heavy Lifting)
Core business logic and external API integrations.

### 1. `audioService.js` (Transcription)
- **Primary Task**: Connects to external Audio-to-Text APIs (e.g., OpenAI Whisper).
- **Workflow**: `Audio File` ➔ `Whisper API` ➔ `Raw Transcript String`.

### 2. `aiService.js` (Intelligence)
- **Primary Task**: Interfacing with LLMs (Claude, Gemini, or OpenAI).
- **`generateSOAP(transcript)`**: Prompts AI to extract **Subjective, Objective, Assessment, and Plan**.
- **`chatWithContext(patientId, query)`**: Fetches DB history via Prisma, feeds it to the AI for a tailored response.

### 3. `dbService.js` (Persistence)
- **Primary Task**: Optional wrapper for Prisma Client calls.
- **Benefit**: Ensures controllers don't interface with the database directly, making testing and refactoring easier.

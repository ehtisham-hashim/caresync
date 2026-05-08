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
3. **Speech-to-Text AI (Whisper)** transcribes the conversation.
4. **LLM (Claude/OpenAI)** analyzes the transcript to generate SOAP notes, a medicine list, precautions, and simplified patient guidance.
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
✅ Whisper transcription integration
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

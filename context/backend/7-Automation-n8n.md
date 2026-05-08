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
*   **Action**: Triggers TTS API (ElevenLabs/OpenAI) to read the simplified instructions -> Uploads generated audio to Supabase/Cloudinary -> Stores the audio URL (`voiceInstructionUrl`) back in the database.

### Workflow 4 — Follow-Up Reminder
*   **Trigger**: Webhook from Backend (Visit completed).
*   **Action**: Schedules a delayed temporal task (e.g., wait 7 days) -> Notifies patient to book a follow-up appointment or check their vitals.

### Workflow 5 — Critical Health Alerts
*   **Trigger**: Webhook from Backend (Abnormal vitals logged).
*   **Action**: Immediately triggers an urgent push notification and SMS to the assigned doctor.

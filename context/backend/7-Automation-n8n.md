# ⚡ n8n Automation Architecture

While the core Node.js backend handles direct API requests, **n8n** is used to orchestrate complex, event-driven, and scheduled background tasks.

## 1. Scheduled Jobs
- **Daily Rollups**: n8n runs nightly scripts to aggregate daily visit statistics for doctor dashboards.
- **Database Maintenance**: Regularly archiving old logs or cleaning up orphaned files in Supabase.

## 2. Reminder Workflows
- **Appointment Reminders**: 24 hours before a scheduled appointment, n8n queries the database and dispatches SMS/Email reminders to patients via Twilio or SendGrid.
- **Medication Adherence**: Daily triggers to remind patients to log their medication intake based on their `MedicationSchedule`.

## 3. AI Summary Workflows
- **Weekly Health Summaries**: Every Sunday, an n8n workflow gathers the patient's weekly vitals and chat logs, sends them to the LLM for a brief analysis, and emails the summary to the patient.

## 4. Notification Workflows
- **Critical Alerts**: If a patient logs an abnormally high heart rate or blood pressure via the app, n8n immediately triggers an urgent push notification to the assigned doctor.

## 5. Event-Driven Automation
- Webhooks from the Node.js backend trigger n8n workflows asynchronously (e.g., upon new user registration, n8n handles sending the welcome email sequence without blocking the API response).

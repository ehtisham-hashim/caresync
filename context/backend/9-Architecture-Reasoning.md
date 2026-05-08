# 🧠 Architecture Reasoning (The "Why")

This document explains the rationale behind the technical decisions made for the CareSync backend. While other documents describe *what* the system does, this document explains *why* the architecture exists in its current form.

## 1. Scalability Reasoning

### Why separate Services from Controllers?
Controllers are kept extremely thin, strictly handling HTTP requests and responses. The actual business logic (e.g., calling OpenAI, processing SOAP notes) is abstracted into **Services**. 
* **Reason**: This allows the same logic to be reused in different contexts. For example, if we introduce a GraphQL API or a background job (n8n worker) later, they can call `aiService.generateSOAP()` directly without needing to mock an Express request object.

### Why use an abstraction layer for AI Providers?
* **Reason**: The AI landscape changes rapidly. By abstracting the AI calls behind `aiService.js`, we prevent vendor lock-in. If OpenAI becomes too expensive or rate-limits us, we can swap to Anthropic Claude or Google Gemini with minimal code changes.

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

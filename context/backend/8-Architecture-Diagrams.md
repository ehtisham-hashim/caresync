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
    Services --> AI[AI Providers: Whisper/Claude]
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
    API->>AI: Send to Whisper (Transcribe)
    AI-->>API: Raw Transcript
    API->>AI: Send to Claude (Generate SOAP)
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
    PrimaryLLM -- Failure / Timeout --> FallbackLLM[Fallback LLM: Claude]
    
    FallbackLLM --> OutputParser
    
    OutputParser -- Valid --> Save[Persist to DB]
    OutputParser -- Invalid --> Retry[Self-Correction Prompt]
```

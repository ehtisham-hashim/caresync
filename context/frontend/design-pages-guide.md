# 🎨 CareSync UI/UX Design & Page Flow Guide

This document is specifically created for the UI/UX Designer. It outlines every page that needs to be designed, what elements should be on each page, and the expected user flow (how users navigate from one screen to the next).

The application has **three distinct experiences** based on the user's role: **Guest (Public)**, **Patient**, and **Doctor**.

---

## 1️⃣ Public & Authentication Flow

**Target Device:** Mobile, Tablet, Desktop (Fully Responsive)

```mermaid
graph TD
    A[Landing Page] --> B(Login)
    A --> C(Register)
    
    B --> D{Role Check}
    C --> D
    
    D -->|isPatient| E[📱 Patient Dashboard]
    D -->|isDoctor| F[💻 Doctor Dashboard]
    
    style A fill:#f9f9f9,stroke:#333,stroke-width:2px
    style B fill:#e1f5fe,stroke:#0288d1
    style C fill:#e1f5fe,stroke:#0288d1
    style D fill:#fff3e0,stroke:#f57c00
```

### 1. Landing Page (Home)

- **Purpose:** Marketing the product, explaining the AI Scribe and Patient Care features.
- **Key Elements:** Hero section, feature highlights, testimonials, clear Call-To-Action (CTA) buttons.
- **Next Step:** Clicking "Login" goes to the Login Page. Clicking "Get Started" goes to Register.

### 2. Login Page

- **Purpose:** Secure entry point into the app.
- **Key Elements:** Email input, Password input, "Forgot Password" link, "Login" button.
- **Next Step:** Upon successful login, the system detects the role and redirects -> Patient goes to `Patient Dashboard`, Doctor goes to `Doctor Dashboard`.

### 3. Registration / Sign Up

- **Purpose:** Account creation.
- **Key Elements:** Name, Email, Password, Role Toggle (I am a Patient / I am a Doctor), Date of Birth.
- **Next Step:** Completing registration logs the user in and redirects to their respective dashboard.

---

## 2️⃣ The Patient Experience (Patient App)

**Target Device:** Mobile-First (Patients will primarily use their phones).

```mermaid
graph TD
    Home[📱 Patient Dashboard] --> Vitals[📈 My Health & Vitals]
    Home --> Meds[💊 Prescriptions & Instructions]
    Home --> Booking[📅 Book Appointments]
    Home --> Chat[🤖 AI Health Companion]
    Home --> Report[📝 Submit Symptom Report]
    
    Meds -.->|Plays| Voice[🔊 AI Voice Instructions]
    
    style Home fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style Chat fill:#f3e5f5,stroke:#8e24aa
```

### 4. Patient Dashboard (Home)

- **Purpose:** The central hub summarizing the patient's current health status.
- **Key Elements:**
  - Greeting ("Good morning, John").
  - "Next Appointment" widget with countdown.
  - "Action Required" alerts (e.g., "Time to take your medication").
  - Quick action buttons (Book Appointment, Chat with AI).
- **Next Step:** Navigation to any of the specific sections below.

### 5. My Health & Vitals

- **Purpose:** Tracking health metrics over time.
- **Key Elements:**
  - Visual charts/graphs showing Heart Rate, Blood Pressure, and Weight over months.
  - "Add New Reading" modal/drawer to input today's vitals.
- **Next Step:** Submitting a reading updates the graph instantly.

### 6. Prescriptions & Care Instructions

- **Purpose:** Helping the patient understand their medications.
- **Key Elements:**
  - List of active medications with dosages (e.g., "1 Pill - Morning").
  - **AI Feature:** A "Simplified Instructions" card written in plain English.
  - **AI Feature:** A "Play Voice Instructions" button to hear the instructions out loud.

### 7. Appointments & Booking

- **Purpose:** Managing doctor visits.
- **Key Elements:**
  - List of past and upcoming visits.
  - "Book New Appointment" flow: Select a doctor -> Select a date -> Select a time slot -> Confirm.

### 8. AI Health Companion (Chat)

- **Purpose:** A conversational interface for health queries.
- **Key Elements:**
  - Standard chat interface (like ChatGPT or iMessage).
  - Text input bar and "Send" button.
  - AI messages should look visually distinct from the patient's messages.

### 9. Submit Health Update (Patient Report)

- **Purpose:** Informing the doctor about symptoms between visits.
- **Key Elements:**
  - Form: Select Doctor, Describe Symptoms, Select Severity (Mild/Moderate/Severe).
  - Submit button.

---

## 3️⃣ The Provider Experience (Doctor Portal)

**Target Device:** Tablet & Desktop-First (Doctors will use iPads or laptops in the clinic).

```mermaid
graph TD
    Home[💻 Doctor Dashboard] --> Directory[👥 Patient Directory]
    Home --> Calendar[📅 Schedule Manager]
    Home --> Reviews[📥 Review Patient Reports]
    
    Directory --> Profile[👤 Patient Profile Detail]
    Profile --> Scribe[🎙️ AI Scribe Console]
    Home -.->|Click Today's Appt| Scribe
    
    style Home fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Scribe fill:#ffebee,stroke:#d32f2f,stroke-width:2px
```

### 10. Doctor Dashboard (Home)

- **Purpose:** The doctor's daily command center.
- **Key Elements:**
  - Today's Schedule / Appointment timeline.
  - "Pending Reviews" widget (Patient reports or abnormal vitals that need attention).
- **Next Step:** Clicking an appointment opens the **AI Scribe Console**.

### 11. Patient Directory

- **Purpose:** A CRM-style list of all patients assigned to the doctor.
- **Key Elements:** Search bar, filter by condition, table/list showing Patient Name, Age, Last Visit Date.
- **Next Step:** Clicking a row opens the **Patient Profile Detail**.

### 12. Patient Profile Detail

- **Purpose:** Deep dive into a single patient's medical history.
- **Key Elements:**
  - Patient demographics (Age, Blood Type, Allergies).
  - List of past visits / SOAP notes.
  - Current active prescriptions.
  - Vitals history.
- **Next Step:** "Start Visit" button -> Redirects to the AI Scribe Console.

### 13. 🌟 AI Scribe Console (The Core Feature)

- **Purpose:** Recording the conversation and generating the automated clinical note. This is the most important screen in the app.

**UI Layout Visualization:**
```mermaid
graph TB
    subgraph UI [AI Scribe Console - Desktop View]
        direction LR
        Sidebar[Left Sidebar:<br>Patient Context & Allergies] --- Workspace[Main Workspace]
        
        subgraph Workspace [Main Workspace]
            direction TB
            Top[Top Bar:<br>🔴 Pulsing Record Button & Timer]
            Top --- Split[Split View Output]
            
            subgraph Split [Split View]
                direction LR
                LeftCol[Left Column:<br>Raw Audio Transcript] --- RightCol[Right Column:<br>Editable SOAP Note Form]
            end
            
            Split --- Bottom[Bottom Bar:<br>Finalize & Save Button]
        end
    end
    
    style Top fill:#ffebee,stroke:#d32f2f
    style RightCol fill:#e8f5e9,stroke:#388e3c
```
- **Key Elements:**
  - **Left Sidebar/Top Bar:** Brief patient context (Name, age, allergies).
  - **Recording Area:** Large, prominent "Record Session" button. A pulsing visualizer animation while recording. A "Stop & Process" button.
  - **Split View Output:**
    - Left Column: Raw transcript of the conversation.
    - Right Column: Editable form fields for the AI-generated **SOAP Note** (Subjective, Objective, Assessment, Plan) and Prescriptions list.
  - **Action:** "Finalize & Save" button at the bottom.

### 14. Calendar & Scheduling Manager

- **Purpose:** Managing doctor availability.
- **Key Elements:** Full month/week calendar view. Ability to block out times or accept/reject pending appointment requests.

### 15. Reports Review / Care Coordination

- **Purpose:** Reviewing symptom updates sent by patients.
- **Key Elements:** Inbox-style list of patient reports. When clicked, it expands to show the patient's message. Includes a "Mark as Reviewed" button.

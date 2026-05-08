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

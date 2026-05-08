# 🗄️ Database Models (NeonDB + Prisma ORM)

Since we are using NeonDB (Serverless PostgreSQL), we utilize Prisma ORM. The data is structured into strict relational tables inside the `prisma/schema.prisma` file.

## 1. User Table
Handles Patients and Doctors.

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  role         Role      // Enum: PATIENT or DOCTOR
  name         String
  dateOfBirth  DateTime?
  medicalHistory String[] // Array of known conditions

  // Relations
  visits Visit[]
  vitals Vital[]
  chats  Chat[]

  createdAt DateTime @default(now())
}

enum Role {
  PATIENT
  DOCTOR
}
```

## 2. Visit Table (SOAP Notes)
Stores ambient recordings and structured AI outputs linked to a specific user.

```prisma
model Visit {
  id        String @id @default(uuid())
  patientId String
  patient   User   @relation(fields: [patientId], references: [id])

  rawTranscript String

  // SOAP Note Fields
  subjective String?
  objective  String?
  assessment String?
  plan       String?

  medicalTerms Json? // e.g., [{"term": "Tachycardia", "meaning": "Fast heart rate"}]

  createdAt DateTime @default(now())
}
```

## 3. Vitals Table
Tracks labs and vitals over time.

```prisma
model Vital {
  id        String @id @default(uuid())
  patientId String
  patient   User   @relation(fields: [patientId], references: [id])

  heartRate     Int?
  bloodPressure String?
  weight        Float?
  temperature   Float?

  labResults Json? // e.g., [{"test": "HbA1c", "value": "5.7", "unit": "%"}]

  recordedAt DateTime @default(now())
}
```

## 4. Chat Session Table
Stores chat history for full health context.

```prisma
model Chat {
  id        String @id @default(uuid())
  patientId String
  patient   User   @relation(fields: [patientId], references: [id])

  messages Json // e.g., [{"role": "user", "text": "Hi"}]

  updatedAt DateTime @updatedAt
}
```

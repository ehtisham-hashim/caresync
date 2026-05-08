# 🏗️ Backend Architecture Overview (PERN Stack)

This document outlines the folder structure and data flow for the PERN backend (PostgreSQL, Express, React, Node), utilizing NeonDB and Prisma ORM for the AI healthcare app.

## 📂 Folder Structure

```text
backend/
├── prisma/             
│   └── schema.prisma   # Single source of truth for DB models
├── src/
│   ├── config/         # Environment & AI API configurations
│   ├── controllers/    # Handles incoming HTTP requests & responses
│   ├── middlewares/    # Custom logic (Auth, File Uploads, Error Handling)
│   ├── routes/         # Express API route definitions
│   ├── services/       # Core Business & AI Logic (Separation of concerns)
│   └── utils/          # Helper functions (Loggers, formatting)
├── .env                # Secret keys (JWT, DB URI, AI API Keys)
└── server.js           # Entry point of the application
```

## 🔄 Program Flow (The Request Lifecycle)

1.  **Client Request**: Frontend sends an audio file or text prompt.
2.  **Route (`routes/`)**: Receives the `/api/ai/scribe` request.
3.  **Middleware (`middlewares/`)**: Verifies JWT (Authentication) and parses audio files via Multer.
4.  **Controller (`controllers/`)**: Takes the parsed file and passes data to the correct service.
5.  **Service (`services/`)**:
    *   Sends audio to Whisper API for transcription.
    *   Sends transcript to Claude/Gemini API to generate **SOAP notes**.
6.  **Database (`prisma/`)**: Service uses Prisma Client to save the generated SOAP note into NeonDB (PostgreSQL).
7.  **Response**: Controller sends a `200 OK` JSON response back to the React frontend.
# 🏥 CareSync Full-Stack Installation Guide

This document provides a comprehensive guide to installing dependencies and configuring both the **Backend (Node.js/Express)** and the **Frontend (React)** for the CareSync application.

## 🛠️ Global Prerequisites
- **Node.js**: v18.0 or higher
- **PostgreSQL**: Local database or NeonDB connection string
- **Redis**: Required for BullMQ background jobs (Local or Upstash)

---

## 🖥️ Backend Setup & Installation

Navigate to the backend directory:
```bash
cd backend
```

### 1. Install Dependencies
Run the following commands to install the required packages for the backend architecture.

**Core Framework & Security:**
```bash
npm install express cors helmet dotenv
npm install jsonwebtoken bcrypt cookie-parser
```

**Database & Validation:**
```bash
npm install prisma @prisma/client
npm install zod
```

**File Storage & AI Integration:**
```bash
npm install multer
npm install axios
```

**Background Jobs:**
```bash
npm install bullmq ioredis
```

**Development Tools:**
```bash
npm install -D nodemon
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
# Server
PORT=5000
NODE_ENV=development

# Database (NeonDB)
DATABASE_URL="postgresql://user:pass@host/db"

# JWT Auth
JWT_SECRET="supersecret_access"
JWT_REFRESH_SECRET="supersecret_refresh"

# AI APIs
DEEPSEEK_API_KEY="your_deepseek_key"
GEMINI_API_KEY="your_gemini_key"

# Storage
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your_anon_key"

# Background Queue
REDIS_URL="redis://localhost:6379"
```

### 3. Database Initialization
```bash
npx prisma generate
npx prisma migrate dev --name init_schema
```

### 4. Running the Backend
```bash
npm run dev
```

---

## 🎨 Frontend Setup & Installation

Navigate to the frontend directory:
```bash
cd ../frontend
```

### 1. Install Dependencies
If you are initializing the project from scratch, use Vite (`npm create vite@latest . -- --template react`). Otherwise, run the following commands.

**Routing & State Management:**
```bash
npm install react-router-dom zustand
```

**HTTP Client:**
```bash
npm install axios
```

**AI Medical Scribe Integration (Audio):**
```bash
npm install react-media-recorder
```

**UI Components:**
```bash
npm install lucide-react clsx
# Note: CareSync relies on Vanilla CSS/Custom tokens. Avoid Tailwind unless explicitly requested.
```

### 2. Environment Configuration
Create a `.env` file in the `frontend/` directory:
```env
# Backend API Base URL
VITE_API_BASE_URL="http://localhost:5000/api/v1"
VITE_NODE_ENV="development"
```

### 3. Running the Frontend
```bash
# Install all dependencies (if cloned from repo)
npm install

# Start the dev server
npm run dev
```

---

## 🚀 Starting the Full Application
To run the full stack simultaneously for development, open two terminal windows:
1. **Terminal 1**: `cd backend && npm run dev`
2. **Terminal 2**: `cd frontend && npm run dev`

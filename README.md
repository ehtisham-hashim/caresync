# CareSync Setup Guide

## Backend Setup Instructions

### 1. Database Configuration (Prisma & NeonDB)
1. Go to [Neon](https://neon.tech/) and create a new project/database.
2. Obtain your PostgreSQL connection string from the Neon dashboard.
3. Add this connection string to your `.env` file as `DATABASE_URL`.
4. Open your terminal in the project directory and run the following commands to generate the Prisma client and push your schema to NeonDB:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### 2. Storage Configuration (Supabase)
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Once created, go to **Project Settings -> API**.
3. Here you will find your **Project URL** (`SUPABASE_URL`) and your **anon** `public` key (`SUPABASE_ANON_KEY`). Add both to your `.env` file.
4. Next, navigate to the **Storage** section from the left sidebar.
5. Click **New Bucket** and name it exactly `audiom`.
6. Select the `audiom` bucket and click on **Policies** (or Configuration -> Policies).
7. Create a new custom policy and name it `full-access`.
8. Under the allowed operations, ensure you select the appropriate actions (for full access, typically all actions).
9. **Important (for testing only)**: In the **Target Roles** dropdown, choose `anon`.
10. Save the policy. This will allow unauthenticated uploads/reads for testing purposes.

### 3. Redis Configuration (Upstash)
1. Go to [Upstash](https://upstash.com/) and create an account or log in.
2. Go to the Redis section and click **Create Database**.
3. Choose a name and region for your database, then create it.
4. Once the database is ready, scroll down to the **Connect** section on the database details page.
5. Click on the **TCP** tab/area.
6. Copy the provided Redis URL (it will look like `redis://...`).
7. Add this URL to your `.env` file as `REDIS_URL`.

### 4. JWT Authentication Keys
To secure your application, you need to generate strong secret keys for JWT (JSON Web Tokens).
1. Open your terminal.
2. Run the following OpenSSL command twice to generate two distinct cryptographically secure keys (one for the main token, one for the refresh token):
   ```bash
   openssl rand -base64 32
   ```
3. Copy the first generated string and add it to your `.env` file as `JWT_SECRET`.
4. Copy the second generated string and add it to your `.env` file as `JWT_REFRESH_SECRET`.

### 5. Gemini API Key (AI Features)
CareSync uses Google's Gemini API for its AI-assisted features (like the Scribe Console).
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click on **Create API key** or navigate to the API keys section.
4. Generate a new API key for your project.
5. Copy the generated API key and add it to your `.env` file as `GEMINI_API_KEY`.

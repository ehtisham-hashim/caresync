import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import bcrypt from 'bcrypt';

// Load .env manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');

// Parse .env file
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^"(.*)"$/, '$1');
    if (!process.env[key]) process.env[key] = value;
  }
});

// Use pg directly to avoid Accelerate complications
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const adminEmail = 'admin@caresync.com';
  const adminPassword = 'Admin123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const client = await pool.connect();
  try {
    // Delete existing admin with same email
    await client.query('DELETE FROM "User" WHERE email = $1', [adminEmail]);

    // Insert admin
    const result = await client.query(
      `INSERT INTO "User" (id, email, "passwordHash", role, name, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, 'ADMIN'::"Role", $3, NOW(), NOW())
       RETURNING id, email, name, role`,
      [adminEmail, hashedPassword, 'CareSync Admin']
    );

    const admin = result.rows[0];
    console.log('');
    console.log('✅ Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Name     : ${admin.name}`);
    console.log(`  Email    : ${admin.email}`);
    console.log(`  Password : ${adminPassword}`);
    console.log(`  Role     : ${admin.role}`);
    console.log(`  ID       : ${admin.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('❌ Error creating admin:', e.message);
  process.exit(1);
});

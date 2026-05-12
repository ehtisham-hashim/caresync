import prisma from '../src/config/db.js';
import bcrypt from 'bcrypt';

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Clean up existing seeded doctors (optional, to avoid unique constraint errors)
  await prisma.user.deleteMany({
    where: { email: 'dr.smith@caresync.com' }
  });

  const doctor = await prisma.user.create({
    data: {
      name: 'Dr. Gregory Smith',
      email: 'dr.smith@caresync.com',
      passwordHash: hashedPassword,
      role: 'DOCTOR',
      doctorProfile: {
        create: {
          specialization: 'Cardiologist',
          licenseNumber: 'MD-12345-CARDIO',
          clinicName: 'CareSync Heart Center',
        }
      }
    }
  });

  console.log(`✅ Doctor created successfully!`);
  console.log(`Name: ${doctor.name}`);
  console.log(`Email: ${doctor.email}`);
  console.log(`Password: Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

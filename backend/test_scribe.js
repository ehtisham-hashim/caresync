import './src/config/env.js';
import prisma from './src/config/db.js';
import { processVisitText } from './src/services/visitService.js';

async function main() {
  console.log("Looking up doctor and patient...");
  
  let doctor = null;
  let patient = null;

  const targetUser = await prisma.user.findUnique({
    where: { email: 'meh942007@gmail.com' }
  });

  if (!targetUser) {
    console.error("Could not find user with email meh942007@gmail.com in the database.");
    process.exit(1);
  }

  if (targetUser.role === 'DOCTOR') {
    doctor = targetUser;
    patient = await prisma.user.findFirst({
      where: { role: 'PATIENT', deletedAt: null }
    });
  } else if (targetUser.role === 'PATIENT') {
    patient = targetUser;
    doctor = await prisma.user.findFirst({
      where: { role: 'DOCTOR', deletedAt: null }
    });
  }

  if (!doctor) {
    console.error("No doctor found. Please ensure a doctor user is registered.");
    process.exit(1);
  }
  if (!patient) {
    console.error("No patient found. Please ensure a patient user is registered.");
    process.exit(1);
  }

  console.log(`Doctor: ${doctor.name} (${doctor.id})`);
  console.log(`Patient: ${patient.name} (${patient.id})`);

  const transcript = `
Doctor: Hello John, how are you feeling today?
Patient: Hello doctor, I've had a bad cough for 3 days and a mild fever of around 100 degrees. Also, my throat is pretty sore.
Doctor: Let's check your lungs... okay, take a deep breath... and another. Yes, your lungs sound clear. Throat is indeed quite red.
Doctor: I'm going to prescribe you Amoxicillin 500mg, to be taken twice daily for 7 days. Also, take paracetamol if the fever goes up. Make sure to get plenty of rest and drink lots of fluids.
Patient: Thank you, doctor. I will do that.
  `;

  console.log("\nSending transcript to AI Scribe service (this will call Gemini)...");
  try {
    const start = Date.now();
    const result = await processVisitText(transcript, patient.id, doctor.id);
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    
    console.log(`\nSuccess! AI Scribe processed the transcript in ${duration}s.\n`);
    console.log("==================== GENERATED SOAP NOTE ====================");
    console.log(JSON.stringify(result.soapNote, null, 2));
    console.log("=============================================================");
    console.log(`Created Visit ID: ${result.visit.id}`);
  } catch (error) {
    console.error("AI Scribe processing failed:", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();

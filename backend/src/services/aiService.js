import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import prisma from '../config/db.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Zod schema for validating AI SOAP response
const soapResponseSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  assessment: z.string(),
  plan: z.string(),
  medicalTerms: z.array(z.object({
    term: z.string(),
    meaning: z.string(),
  })).optional().default([]),
});

/**
 * Generate structured SOAP notes from a raw transcript.
 * Uses Gemini as primary LLM. Validates output with Zod.
 */
export const generateSOAP = async (transcript) => {
  const systemPrompt = `You are a clinical documentation assistant specializing in medical scribing. 
You must analyze the following doctor-patient conversation transcript and extract a structured SOAP note.

Rules:
- You are an ASSISTANT only — do NOT diagnose or prescribe independently.
- Output MUST be valid JSON matching this exact structure:
{
  "subjective": "Patient's reported symptoms, concerns, and history discussed",
  "objective": "Observable findings, vitals mentioned, physical exam details",
  "assessment": "Doctor's clinical assessment and differential diagnosis discussed",
  "plan": "Treatment plan, medications, follow-ups discussed by the doctor",
  "medicalTerms": [{"term": "Medical Term", "meaning": "Plain English explanation"}]
}
- Be thorough and clinical in tone.
- Extract ALL medical terminology mentioned and provide plain-English meanings.
- The "term" key in the "medicalTerms" array MUST always be written as the standardized clinical English term (e.g., "Heart" instead of "dil" or "دل", and "Pain" instead of "dard" or "درد") regardless of the language or Romanized script used in the input transcript.
- If a SOAP section has no relevant content, use "Not discussed in this visit."`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Transcript:\n${transcript}` },
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse and validate with Zod
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      logger.warn('AI returned non-JSON response, attempting self-correction...');
      return await retrySoapGeneration(transcript);
    }

    const validated = soapResponseSchema.safeParse(parsed);
    if (!validated.success) {
      logger.warn('AI response failed Zod validation, retrying...');
      return await retrySoapGeneration(transcript);
    }

    return validated.data;
  } catch (error) {
    logger.error('SOAP generation failed', { error: error.message });
    throw new ApiError(500, 'Failed to generate SOAP notes.', ERROR_CODES.AI_SERVICE_ERROR);
  }
};

/**
 * Self-correction retry: asks AI to fix malformed output.
 */
const retrySoapGeneration = async (transcript) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await model.generateContent([
    {
      text: `Your previous response was malformed. Please generate a valid JSON SOAP note from this transcript.
The JSON must have exactly these keys: subjective, objective, assessment, plan, medicalTerms.
medicalTerms is an array of objects with "term" and "meaning" keys.
Transcript:\n${transcript}`,
    },
  ]);

  const response = await result.response;
  const parsed = JSON.parse(response.text());
  const validated = soapResponseSchema.parse(parsed);
  return validated;
};

/**
 * Generate a pre-visit brief for a doctor.
 * Aggregates patient's recent visits, vitals, allergies, and active prescriptions.
 */
export const generatePreVisitBrief = async (patientId) => {
  // Gather patient context
  const [patient, recentVisits, vitals, allergies, prescriptions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: patientId },
      select: {
        name: true,
        dateOfBirth: true,
        bloodGroup: true,
        medicalHistory: true,
        familyHistory: true,
      },
    }),
    prisma.visit.findMany({
      where: { patientId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { subjective: true, assessment: true, plan: true, createdAt: true },
    }),
    prisma.vital.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      take: 3,
    }),
    prisma.allergy.findMany({ where: { patientId } }),
    prisma.prescription.findMany({
      where: { patientId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { medicineName: true, dosage: true, frequency: true },
    }),
  ]);

  const contextString = JSON.stringify({
    patient,
    recentVisits,
    vitals,
    allergies,
    activePrescriptions: prescriptions,
  });

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    {
      text: `You are a clinical assistant. Generate a concise 1-page pre-visit brief for a doctor about to see this patient.
Include: key medical history, chronic conditions, recent visit summaries, current medications, allergies, and notable vitals trends.
Be clinical and actionable. Format as a clear summary with sections.

Patient Data:
${contextString}`,
    },
  ]);

  const response = await result.response;
  return response.text();
};

/**
 * AI Health Companion chat with patient context.
 * Fetches limited DB context to manage token budget.
 */
export const chatWithContext = async (patientId, query) => {
  // Fetch limited context: last 5 messages, 3 recent vitals, active prescriptions, allergies
  const [chat, vitals, prescriptions, allergies] = await Promise.all([
    prisma.chat.findFirst({
      where: { patientId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    }),
    prisma.vital.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      take: 3,
    }),
    prisma.prescription.findMany({
      where: { patientId, deletedAt: null },
      select: { medicineName: true, dosage: true, frequency: true, simplifiedInstructions: true },
    }),
    prisma.allergy.findMany({ where: { patientId } }),
  ]);

  const contextString = JSON.stringify({
    recentMessages: chat?.messages?.reverse() || [],
    recentVitals: vitals,
    activePrescriptions: prescriptions,
    allergies,
  });

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    {
      text: `You are CareSync AI Health Companion — a friendly, knowledgeable health assistant.

Rules:
- You are NOT a doctor. Never diagnose or prescribe.
- Provide general health information, explain medications, and offer lifestyle guidance.
- If a question requires medical advice, always recommend consulting their doctor.
- Be warm, empathetic, and use simple language.
- Reference the patient's actual data (medications, allergies, vitals) when relevant.

Patient Context:
${contextString}

Patient's Question: ${query}`,
    },
  ]);

  const response = await result.response;
  const aiMessage = response.text();

  // Persist the conversation
  let chatRecord = chat;
  if (!chatRecord) {
    chatRecord = await prisma.chat.create({ data: { patientId } });
  }

  await prisma.chatMessage.createMany({
    data: [
      { chatId: chatRecord.id, role: 'user', content: query },
      { chatId: chatRecord.id, role: 'assistant', content: aiMessage },
    ],
  });

  return aiMessage;
};

/**
 * Explain a medical term in simple language (Tap-to-Explain feature).
 */
export const explainMedicalTerm = async (term) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    {
      text: `You are a medical terminology translator. Explain the following medical term in simple, patient-friendly language.
Include:
1. A simple definition (1-2 sentences)
2. Why it matters for the patient
3. When to be concerned

Medical term: "${term}"`,
    },
  ]);

  const response = await result.response;
  return response.text();
};

/**
 * Translate clinical/medical text into simple, patient-friendly layperson language in a target language.
 */
export const translateMedicalText = async (text, targetLanguage) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    {
      text: `You are a professional medical translator. Your job is to translate the following medical instructions, notes, or plan into simple, patient-friendly, and highly accurate ${targetLanguage}.
      
Guidelines:
1. Explain any complex clinical terms in simple, plain terms that an ordinary patient can understand.
2. Keep the translation warm, supportive, and extremely clear.
3. Match the original formatting (like bullets or numbered steps) as closely as possible.
4. If some terms don't translate directly, use the most appropriate local equivalent.

Text to translate:
"${text}"`,
    },
  ]);

  const response = await result.response;
  return response.text();
};

/**
 * Translate clinical/medical text in a JSON object structure into simple, patient-friendly language.
 */
export const translateMedicalObject = async (contentObj, targetLanguage) => {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await model.generateContent([
    {
      text: `You are a professional medical translator. Translate the string values of the following JSON object into simple, patient-friendly, and highly accurate ${targetLanguage}.
      
Guidelines:
1. Explain any complex clinical terms in simple, plain terms.
2. Keep the translation warm, supportive, and extremely clear.
3. Keep the exact same JSON structure and keys. Return ONLY valid JSON.

JSON to translate:
${JSON.stringify(contentObj)}`,
    },
  ]);

  const response = await result.response;
  try {
    const parsed = JSON.parse(response.text());
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('AI response is not a valid JSON object');
    }
    
    const expectedKeys = Object.keys(contentObj);
    const hasMatchingKeys = expectedKeys.some(key => key in parsed);
    if (!hasMatchingKeys && expectedKeys.length > 0) {
      throw new Error('AI response structure does not match expected keys');
    }
    
    return parsed;
  } catch (error) {
    logger.error('Failed to validate translated JSON', { error: error.message });
    throw new ApiError(500, 'Translation formatting failed', ERROR_CODES.AI_SERVICE_ERROR);
  }
};

export default { generateSOAP, generatePreVisitBrief, chatWithContext, explainMedicalTerm, translateMedicalText, translateMedicalObject };

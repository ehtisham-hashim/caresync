import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import * as visitService from '../services/visitService.js';
import * as audioService from '../services/audioService.js';
import * as aiService from '../services/aiService.js';
import * as storageService from '../services/storageService.js';
import fs from 'fs';

/**
 * Full AI scribe pipeline:
 * 1. Transcribe audio via Gemini Flash (STT) — needs local file
 * 2. Upload audio to Supabase Storage — deletes local file
 * 3. Generate SOAP note via AI LLM
 * 4. Save visit record to DB
 */
export const processVisitAudio = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Audio file is required.');
  }

  const { patientId } = req.body;
  if (!patientId) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw new ApiError(400, 'Patient ID is required.');
  }

  const filePath = req.file.path;

  // 1. Transcribe audio (needs local file)
  const rawTranscript = await audioService.transcribeAudio(filePath);

  // 2. Upload audio to Supabase (deletes temp file after upload)
  const audioUrl = await storageService.uploadFile(filePath, 'audio', 'visits');

  // 3. Generate SOAP note from transcript
  const soapNote = await aiService.generateSOAP(rawTranscript);

  // 4. Save visit record to DB
  const visit = await visitService.createVisit({
    patientId,
    doctorId: req.user.id,
    audioUrl,
    rawTranscript,
    subjective: soapNote.subjective,
    objective: soapNote.objective,
    assessment: soapNote.assessment,
    plan: soapNote.plan,
    medicalTerms: soapNote.medicalTerms,
  });

  sendSuccess(res, 201, 'Visit processed successfully.', {
    visit,
    soapNote,
  });
});

export const getPatientVisits = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await visitService.getPatientVisits(patientId, { page, limit });
  sendSuccess(res, 200, 'Visits fetched.', result);
});

export const getVisitDetail = asyncHandler(async (req, res) => {
  const visit = await visitService.getVisitDetail(req.params.id);
  sendSuccess(res, 200, 'Visit detail fetched.', visit);
});

export const deleteVisit = asyncHandler(async (req, res) => {
  const result = await visitService.deleteVisit(req.params.id, req.user.id);
  sendSuccess(res, 200, result.message);
});

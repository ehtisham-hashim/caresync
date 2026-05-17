import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as aiService from '../services/aiService.js';

export const askHealthCompanion = asyncHandler(async (req, res) => {
  const patientId = req.body.patientId || req.user.id;
  const response = await aiService.chatWithContext(patientId, req.body.query);
  sendSuccess(res, 200, 'AI response generated.', { response });
});

export const explainMedicalTerm = asyncHandler(async (req, res) => {
  const explanation = await aiService.explainMedicalTerm(req.body.term);
  sendSuccess(res, 200, 'Term explained.', { explanation });
});

export const translateContent = asyncHandler(async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ success: false, message: 'Text and targetLanguage are required.' });
  }
  const translation = await aiService.translateMedicalText(text, targetLanguage);
  sendSuccess(res, 200, 'Text translated successfully.', { translation });
});

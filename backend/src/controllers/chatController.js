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
  const { text, obj, targetLanguage } = req.body;
  if (!targetLanguage) {
    return res.status(400).json({ success: false, message: 'targetLanguage is required.' });
  }

  if (obj) {
    const translation = await aiService.translateMedicalObject(obj, targetLanguage);
    return sendSuccess(res, 200, 'Object translated successfully.', { translation });
  }

  if (text) {
    const translation = await aiService.translateMedicalText(text, targetLanguage);
    return sendSuccess(res, 200, 'Text translated successfully.', { translation });
  }

  return res.status(400).json({ success: false, message: 'Either text or obj is required.' });
});

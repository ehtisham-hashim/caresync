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

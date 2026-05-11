import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Transcribe audio using Google Gemini Flash (multimodal).
 * Sends the audio file and asks for a verbatim transcript.
 */
export const transcribeAudio = async (filePath) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const audioBuffer = fs.readFileSync(filePath);
    const base64Audio = audioBuffer.toString('base64');
    const mimeType = getMimeType(filePath);

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Audio,
        },
      },
      {
        text: `You are a medical transcription assistant. Transcribe the following audio recording of a doctor-patient conversation verbatim. 
Include all medical terminology exactly as spoken. Do not summarize or interpret — provide the raw transcript only.
If the audio is unclear, indicate unclear portions with [inaudible].`,
      },
    ]);

    const response = await result.response;
    const transcript = response.text();

    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Empty transcript received from Gemini.');
    }

    logger.info('Audio transcription completed successfully.');
    return transcript.trim();
  } catch (error) {
    logger.error('Audio transcription failed', { error: error.message });
    throw new ApiError(500, 'Failed to transcribe audio.', ERROR_CODES.AI_SERVICE_ERROR);
  }
};

const getMimeType = (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();
  const types = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    webm: 'audio/webm',
    ogg: 'audio/ogg',
  };
  return types[ext] || 'audio/mpeg';
};

export default { transcribeAudio };

import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/apiResponse.js';

// Allowed MIME types for uploads
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg'];
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALL_ALLOWED_TYPES = [...ALLOWED_AUDIO_TYPES, ...ALLOWED_IMAGE_TYPES];

// Max file size: 25MB
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALL_ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} is not allowed.`), false);
  }
};

/**
 * Audio upload middleware — single file, field name "audio".
 */
export const uploadAudio = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only audio files (mp3, wav, webm, ogg) are allowed.'), false);
    }
  },
  limits: { fileSize: MAX_FILE_SIZE },
}).single('audio');

/**
 * Image upload middleware — single file, field name "image".
 */
export const uploadImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only image files (png, jpg, webp) are allowed.'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for images
}).single('image');

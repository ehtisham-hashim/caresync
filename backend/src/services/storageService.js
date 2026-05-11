import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Upload a file to Supabase Storage.
 * @param {string} localFilePath - Absolute path to the temp file on disk.
 * @param {string} bucket - Supabase storage bucket name (e.g., 'audio', 'avatars').
 * @param {string} folder - Folder inside the bucket (e.g., 'visits', 'profiles').
 * @returns {string} Public URL of the uploaded file.
 */
export const uploadFile = async (localFilePath, bucket = 'audio', folder = 'uploads') => {
  try {
    const fileBuffer = fs.readFileSync(localFilePath);
    const fileName = `${folder}/${Date.now()}-${path.basename(localFilePath)}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: getContentType(localFilePath),
        upsert: false,
      });

    if (error) {
      throw new ApiError(500, `Storage upload failed: ${error.message}`, ERROR_CODES.STORAGE_ERROR);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    // Delete local temp file immediately after upload
    fs.unlinkSync(localFilePath);
    logger.info(`Temp file deleted: ${localFilePath}`);

    return urlData.publicUrl;
  } catch (error) {
    // Always clean up temp file even on error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to upload file.', ERROR_CODES.STORAGE_ERROR);
  }
};

/**
 * Determine content type from file extension.
 */
const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.webm': 'audio/webm',
    '.ogg': 'audio/ogg',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  };
  return types[ext] || 'application/octet-stream';
};

export default { uploadFile };

import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';

// The key must be exactly 32 bytes (256 bits) long
const getKey = () => Buffer.from(env.ENCRYPTION_KEY, 'utf-8');

/**
 * Encrypts a plain text string using AES-256-GCM.
 * Returns a formatted string containing the IV, Auth Tag, and Ciphertext.
 */
export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(12); // 96-bit IV is standard for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return a single string joined by colons: IV:AuthTag:Ciphertext
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts a formatted string previously encrypted by this service.
 */
export const decrypt = (encryptedData: string): string => {
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format. Expected IV:AuthTag:Ciphertext');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
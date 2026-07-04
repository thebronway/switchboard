import argon2 from 'argon2';

/**
 * Hashes a plain text password using Argon2.
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await argon2.hash(password);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed.');
  }
};

/**
 * Verifies a plain text password against an Argon2 hash.
 */
export const verifyPassword = async (hash: string, password: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};
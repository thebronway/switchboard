import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load variables from ../db/.env if we are running locally
if (process.env.NODE_ENV !== 'production') {
  const customEnvPath = path.resolve(process.cwd(), '../db/.env');
  if (fs.existsSync(customEnvPath)) {
    dotenv.config({ path: customEnvPath });
  } else {
    // Fallback to standard .env if the custom path isn't found
    dotenv.config();
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Security
  ENCRYPTION_KEY: z.string().length(32, "ENCRYPTION_KEY must be exactly 32 characters (256-bit)"),

  // Database Configuration
  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Environment validation failed. The app will not start.');
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;
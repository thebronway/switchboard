import { Pool } from 'pg';
import { env } from '../config/env';

// Initialize the PostgreSQL connection pool using validated environment variables
export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

// Defense in depth: Catch idle client errors so they don't crash the Node process silently
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

/**
 * A helper to quickly execute a query.
 */
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

/**
 * A helper to get a dedicated client from the pool (useful for transactions).
 * Always remember to call client.release() when done!
 */
export const getClient = () => {
  return pool.connect();
};
import fs from 'fs';
import path from 'path';
import { getClient } from './connection';

async function runMigrations() {
  const client = await getClient();
  
  try {
    console.log('Starting database migrations...');
    
    // Path to the migrations directory
    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Read the SQL file
    const schemaSql = fs.readFileSync(path.join(migrationsDir, '001_initial_schema.sql'), 'utf-8');
    
    // Execute the SQL
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');
    
    console.log('✅ Migrations completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

runMigrations();
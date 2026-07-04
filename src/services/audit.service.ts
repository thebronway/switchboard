import { query } from '../db/connection';

interface AuditLogParams {
  userId?: string;
  action: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Securely writes an action to the audit_logs table.
 */
export const logAction = async ({ userId, action, details = {}, ipAddress }: AuditLogParams): Promise<void> => {
  try {
    const sql = `
      INSERT INTO audit_logs (user_id, action, details, ip_address)
      VALUES ($1, $2, $3, $4)
    `;
    const params = [userId || null, action, JSON.stringify(details), ipAddress || null];
    
    await query(sql, params);
  } catch (error) {
    // We log to console to prevent the main application loop from crashing if auditing fails,
    // but in a strict compliance environment, you might want to halt the main transaction here.
    console.error('CRITICAL: Failed to write audit log', error);
  }
};
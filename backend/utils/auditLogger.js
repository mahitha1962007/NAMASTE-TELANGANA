// ============================================
// Audit Logger Utility
// ============================================
// Logs important actions to audit_logs table or mock store.

const { getPool, isDatabaseConnected } = require('../config/db');
const mockStore = require('./mockData');

/**
 * Create an audit log entry.
 * @param {Object} params
 * @param {number|null} params.assignmentId - Related assignment ID
 * @param {string} params.action - Action description
 * @param {string|null} params.oldValue - Previous value
 * @param {string|null} params.newValue - New value
 * @param {number} params.changedBy - User ID who performed the action
 */
async function logAudit({ assignmentId = null, action, oldValue = null, newValue = null, changedBy }) {
  const now = new Date().toISOString();

  if (isDatabaseConnected()) {
    const pool = getPool();
    await pool.execute(
      'INSERT INTO audit_logs (assignment_id, action, old_value, new_value, changed_by) VALUES (?, ?, ?, ?, ?)',
      [assignmentId, action, oldValue, newValue, changedBy]
    );
  } else {
    // Mock mode: store in memory
    const id = mockStore.getNextId('audit_logs');
    mockStore.audit_logs.push({
      id,
      assignment_id: assignmentId,
      action,
      old_value: oldValue,
      new_value: newValue,
      changed_by: changedBy,
      created_at: now,
    });
  }
}

module.exports = { logAudit };

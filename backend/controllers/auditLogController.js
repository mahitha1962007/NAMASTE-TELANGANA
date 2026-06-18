// ============================================
// Audit Log Controller
// ============================================

const { getPool, isDatabaseConnected } = require('../config/db');
const mockStore = require('../utils/mockData');

/**
 * GET /api/audit-logs
 * Get all audit logs. Admin only.
 */
async function getAllAuditLogs(req, res) {
  try {
    let logs = [];

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT al.*, u.name as changed_by_name, a.title as assignment_title
         FROM audit_logs al
         LEFT JOIN users u ON al.changed_by = u.id
         LEFT JOIN assignments a ON al.assignment_id = a.id
         ORDER BY al.created_at DESC LIMIT 100`
      );
      logs = rows;
    } else {
      logs = mockStore.audit_logs
        .map((l) => {
          const user = mockStore.users.find((u) => u.id === l.changed_by);
          const assignment = mockStore.assignments.find((a) => a.id === l.assignment_id);
          return { ...l, changed_by_name: user?.name, assignment_title: assignment?.title };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 100);
    }

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('GetAllAuditLogs error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * GET /api/audit-logs/:assignmentId
 * Get audit logs for a specific assignment.
 */
async function getAuditLogsByAssignment(req, res) {
  try {
    const { assignmentId } = req.params;
    let logs = [];

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT al.*, u.name as changed_by_name FROM audit_logs al
         LEFT JOIN users u ON al.changed_by = u.id
         WHERE al.assignment_id = ? ORDER BY al.created_at DESC`,
        [assignmentId]
      );
      logs = rows;
    } else {
      logs = mockStore.audit_logs
        .filter((l) => l.assignment_id === parseInt(assignmentId))
        .map((l) => {
          const user = mockStore.users.find((u) => u.id === l.changed_by);
          return { ...l, changed_by_name: user?.name };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('GetAuditLogsByAssignment error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

module.exports = { getAllAuditLogs, getAuditLogsByAssignment };

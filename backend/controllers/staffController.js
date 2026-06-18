// ============================================
// Staff Controller
// ============================================

const bcrypt = require('bcryptjs');
const { getPool, isDatabaseConnected } = require('../config/db');
const mockStore = require('../utils/mockData');
const { logAudit } = require('../utils/auditLogger');

/**
 * GET /api/staff
 * Get all staff members. Supports ?role= filter.
 * Admin only.
 */
async function getAllStaff(req, res) {
  try {
    const { role } = req.query;
    let staff = [];

    if (isDatabaseConnected()) {
      const pool = getPool();
      let query = 'SELECT id, name, email, role, department, phone, is_active, created_at FROM users WHERE role != ?';
      const params = ['admin'];

      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }
      query += ' ORDER BY name ASC';

      const [rows] = await pool.execute(query, params);
      staff = rows;
    } else {
      staff = mockStore.users
        .filter((u) => u.role !== 'admin' && (!role || u.role === role))
        .map(({ password_hash, ...rest }) => rest);
    }

    // Attach active task count per staff member
    for (const member of staff) {
      if (isDatabaseConnected()) {
        const pool = getPool();
        const [countRows] = await pool.execute(
          `SELECT COUNT(*) as count FROM assignment_members am
           JOIN assignments a ON am.assignment_id = a.id
           WHERE am.user_id = ? AND a.status NOT IN ('Completed', 'Archived')`,
          [member.id]
        );
        member.active_tasks = countRows[0].count;
      } else {
        const activeAssignmentIds = mockStore.assignment_members
          .filter((am) => am.user_id === member.id)
          .map((am) => am.assignment_id);
        member.active_tasks = mockStore.assignments.filter(
          (a) => activeAssignmentIds.includes(a.id) && !['Completed', 'Archived'].includes(a.status)
        ).length;
      }
    }

    res.json({ success: true, data: staff });
  } catch (error) {
    console.error('GetAllStaff error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * POST /api/staff
 * Create a new staff member. Admin only.
 */
async function createStaff(req, res) {
  try {
    const { name, email, password, role, department, phone } = req.body;

    // Check if email exists
    let existing = null;
    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      existing = rows[0];
    } else {
      existing = mockStore.users.find((u) => u.email === email);
    }

    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists.', code: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    let newStaff;

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password_hash, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, password_hash, role, department || null, phone || null]
      );
      newStaff = { id: result.insertId, name, email, role, department, phone, is_active: true };
    } else {
      const id = mockStore.getNextId('users');
      const now = new Date().toISOString();
      newStaff = {
        id, name, email, password_hash, role,
        department: department || null, phone: phone || null,
        is_active: true, created_at: now, updated_at: now,
      };
      mockStore.users.push(newStaff);
      newStaff = { id, name, email, role, department, phone, is_active: true };
    }

    await logAudit({
      action: 'Staff Account Created',
      newValue: `${name} (${role})`,
      changedBy: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Staff created successfully.', data: newStaff });
  } catch (error) {
    console.error('CreateStaff error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * PUT /api/staff/:id
 * Update staff details. Admin only.
 */
async function updateStaff(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, department, phone } = req.body;

    if (isDatabaseConnected()) {
      const pool = getPool();
      await pool.execute(
        'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), department = COALESCE(?, department), phone = COALESCE(?, phone) WHERE id = ?',
        [name, email, role, department, phone, id]
      );
    } else {
      const user = mockStore.users.find((u) => u.id === parseInt(id));
      if (!user) return res.status(404).json({ success: false, message: 'Staff not found.', code: 404 });
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (department) user.department = department;
      if (phone) user.phone = phone;
      user.updated_at = new Date().toISOString();
    }

    res.json({ success: true, message: 'Staff updated successfully.' });
  } catch (error) {
    console.error('UpdateStaff error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * PATCH /api/staff/:id/deactivate
 * Deactivate a staff account. Admin only.
 */
async function deactivateStaff(req, res) {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      const pool = getPool();
      await pool.execute('UPDATE users SET is_active = false WHERE id = ?', [id]);
    } else {
      const user = mockStore.users.find((u) => u.id === parseInt(id));
      if (!user) return res.status(404).json({ success: false, message: 'Staff not found.', code: 404 });
      user.is_active = false;
      user.updated_at = new Date().toISOString();
    }

    await logAudit({
      action: 'Staff Deactivated',
      newValue: `User ID: ${id}`,
      changedBy: req.user.id,
    });

    res.json({ success: true, message: 'Staff deactivated successfully.' });
  } catch (error) {
    console.error('DeactivateStaff error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * GET /api/staff/suggest
 * Suggest least-busy staff for each role.
 */
async function suggestStaff(req, res) {
  try {
    const roles = ['reporter', 'interviewer', 'photographer', 'editor'];
    const suggestions = {};

    for (const role of roles) {
      let staffList = [];

      if (isDatabaseConnected()) {
        const pool = getPool();
        const [rows] = await pool.execute(
          `SELECT u.id, u.name, u.role,
            (SELECT COUNT(*) FROM assignment_members am JOIN assignments a ON am.assignment_id = a.id
             WHERE am.user_id = u.id AND a.status NOT IN ('Completed','Archived')) as active_tasks
           FROM users u WHERE u.role = ? AND u.is_active = true ORDER BY active_tasks ASC`,
          [role]
        );
        staffList = rows;
      } else {
        staffList = mockStore.users
          .filter((u) => u.role === role && u.is_active)
          .map((u) => {
            const ids = mockStore.assignment_members.filter((am) => am.user_id === u.id).map((am) => am.assignment_id);
            const active = mockStore.assignments.filter((a) => ids.includes(a.id) && !['Completed', 'Archived'].includes(a.status)).length;
            return { id: u.id, name: u.name, role: u.role, active_tasks: active };
          })
          .sort((a, b) => a.active_tasks - b.active_tasks);
      }

      suggestions[role] = staffList[0] || null;
    }

    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('SuggestStaff error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

module.exports = { getAllStaff, createStaff, updateStaff, deactivateStaff, suggestStaff };

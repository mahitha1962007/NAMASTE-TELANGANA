// ============================================
// Note Controller
// ============================================

const { getPool, isDatabaseConnected } = require('../config/db');
const mockStore = require('../utils/mockData');
const { logAudit } = require('../utils/auditLogger');

/**
 * POST /api/assignments/:id/notes
 * Add a progress note to an assignment.
 */
async function addNote(req, res) {
  try {
    const assignmentId = parseInt(req.params.id);
    const { note } = req.body;
    const userId = req.user.id;
    let noteId;

    // Staff can only add notes to their own assignments
    if (req.user.role !== 'admin') {
      let isMember = false;
      if (isDatabaseConnected()) {
        const pool = getPool();
        const [rows] = await pool.execute('SELECT id FROM assignment_members WHERE assignment_id = ? AND user_id = ?', [assignmentId, userId]);
        isMember = rows.length > 0;
      } else {
        isMember = mockStore.assignment_members.some((am) => am.assignment_id === assignmentId && am.user_id === userId);
      }
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this task.', code: 403 });
      }
    }

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [result] = await pool.execute(
        'INSERT INTO task_notes (assignment_id, user_id, note) VALUES (?, ?, ?)',
        [assignmentId, userId, note]
      );
      noteId = result.insertId;
    } else {
      noteId = mockStore.getNextId('task_notes');
      mockStore.task_notes.push({
        id: noteId,
        assignment_id: assignmentId,
        user_id: userId,
        note,
        created_at: new Date().toISOString(),
      });
    }

    await logAudit({
      assignmentId,
      action: 'Note Added',
      newValue: note.substring(0, 100),
      changedBy: userId,
    });

    res.status(201).json({ success: true, message: 'Note added successfully.', data: { id: noteId } });
  } catch (error) {
    console.error('AddNote error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * GET /api/assignments/:id/notes
 * Get all notes for an assignment.
 */
async function getNotes(req, res) {
  try {
    const assignmentId = parseInt(req.params.id);
    let notes = [];

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT tn.*, u.name as user_name FROM task_notes tn
         JOIN users u ON tn.user_id = u.id
         WHERE tn.assignment_id = ? ORDER BY tn.created_at DESC`,
        [assignmentId]
      );
      notes = rows;
    } else {
      notes = mockStore.task_notes
        .filter((n) => n.assignment_id === assignmentId)
        .map((n) => {
          const user = mockStore.users.find((u) => u.id === n.user_id);
          return { ...n, user_name: user?.name };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('GetNotes error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

module.exports = { addNote, getNotes };

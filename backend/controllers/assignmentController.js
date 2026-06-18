// ============================================
// Assignment Controller
// ============================================
// Core logic for creating, editing, and managing editorial assignments.

const { getPool, isDatabaseConnected } = require('../config/db');
const mockStore = require('../utils/mockData');
const { logAudit } = require('../utils/auditLogger');
const { createBulkNotifications } = require('../utils/notificationHelper');

/**
 * POST /api/assignments
 * Create a new assignment with members, events, notifications, and audit log.
 * Admin only.
 */
async function createAssignment(req, res) {
  try {
    const {
      title, description, category, content_type, priority, status,
      publication_deadline, instructions,
      reporter_id, interviewer_id, photographer_id, editor_id,
      interview_date, photo_shoot_date,
    } = req.body;

    // Role validation: verify each selected user has the correct role
    const roleChecks = [
      { id: reporter_id, expectedRole: 'reporter', label: 'Reporter' },
      { id: interviewer_id, expectedRole: 'interviewer', label: 'Interviewer' },
      { id: photographer_id, expectedRole: 'photographer', label: 'Photographer' },
      { id: editor_id, expectedRole: 'editor', label: 'Editor' },
    ];

    for (const check of roleChecks) {
      if (!check.id) continue;
      let user = null;
      if (isDatabaseConnected()) {
        const pool = getPool();
        const [rows] = await pool.execute('SELECT id, role FROM users WHERE id = ?', [check.id]);
        user = rows[0];
      } else {
        user = mockStore.users.find((u) => u.id === parseInt(check.id));
      }
      if (!user) {
        return res.status(400).json({ success: false, message: `${check.label} user not found.`, code: 400 });
      }
      if (user.role !== check.expectedRole) {
        return res.status(400).json({ success: false, message: `Selected user is not a ${check.expectedRole}.`, code: 400 });
      }
    }

    let assignmentId;
    const now = new Date().toISOString();

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [result] = await pool.execute(
        `INSERT INTO assignments (title, description, category, content_type, priority, status, publication_deadline, instructions, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, category, content_type, priority || 'Medium', status || 'Assigned', publication_deadline, instructions, req.user.id]
      );
      assignmentId = result.insertId;
    } else {
      assignmentId = mockStore.getNextId('assignments');
      mockStore.assignments.push({
        id: assignmentId, title, description, category, content_type,
        priority: priority || 'Medium', status: status || 'Assigned',
        publication_deadline, instructions, created_by: req.user.id,
        created_at: now, updated_at: now,
      });
    }

    // Insert assignment members
    const members = [
      { userId: reporter_id, role: 'reporter' },
      { userId: interviewer_id, role: 'interviewer' },
      { userId: photographer_id, role: 'photographer' },
      { userId: editor_id, role: 'editor' },
    ].filter((m) => m.userId);

    for (const member of members) {
      if (isDatabaseConnected()) {
        const pool = getPool();
        await pool.execute(
          'INSERT INTO assignment_members (assignment_id, user_id, role_in_assignment, assigned_by) VALUES (?, ?, ?, ?)',
          [assignmentId, member.userId, member.role, req.user.id]
        );
      } else {
        mockStore.assignment_members.push({
          id: mockStore.getNextId('assignment_members'),
          assignment_id: assignmentId, user_id: parseInt(member.userId),
          role_in_assignment: member.role, assigned_by: req.user.id, assigned_at: now,
        });
      }
    }

    // Create events
    const eventsToCreate = [];
    if (interview_date && (interviewer_id || reporter_id)) {
      eventsToCreate.push({
        assignment_id: assignmentId, event_type: 'Interview',
        title: `Interview: ${title}`, event_date: interview_date,
        assigned_to: interviewer_id || reporter_id,
      });
    }
    if (photo_shoot_date && photographer_id) {
      eventsToCreate.push({
        assignment_id: assignmentId, event_type: 'Photo Shoot',
        title: `Photo Shoot: ${title}`, event_date: photo_shoot_date,
        assigned_to: photographer_id,
      });
    }
    if (publication_deadline) {
      eventsToCreate.push({
        assignment_id: assignmentId, event_type: 'Publication Deadline',
        title: `Publish: ${title}`, event_date: publication_deadline,
        assigned_to: editor_id || null,
      });
    }

    for (const evt of eventsToCreate) {
      if (isDatabaseConnected()) {
        const pool = getPool();
        await pool.execute(
          'INSERT INTO events (assignment_id, event_type, title, event_date, assigned_to) VALUES (?, ?, ?, ?, ?)',
          [evt.assignment_id, evt.event_type, evt.title, evt.event_date, evt.assigned_to]
        );
      } else {
        mockStore.events.push({
          id: mockStore.getNextId('events'),
          ...evt, location: null, status: 'Scheduled', created_at: now,
        });
      }
    }

    // Create notifications for all assigned members
    const notifs = members.map((m) => ({
      userId: parseInt(m.userId),
      assignmentId,
      message: `You have been assigned as ${m.role.charAt(0).toUpperCase() + m.role.slice(1)} for "${title}"`,
      type: 'new_assignment',
    }));
    await createBulkNotifications(notifs);

    // Audit log
    await logAudit({
      assignmentId, action: 'Assignment Created',
      newValue: title, changedBy: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Assignment created successfully.', data: { id: assignmentId } });
  } catch (error) {
    console.error('CreateAssignment error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * GET /api/assignments
 * Get all assignments with member info. Admin only.
 */
async function getAllAssignments(req, res) {
  try {
    let assignments = [];

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT a.*, u.name as created_by_name FROM assignments a
         LEFT JOIN users u ON a.created_by = u.id
         ORDER BY a.created_at DESC`
      );
      assignments = rows;

      // Attach members
      for (const assignment of assignments) {
        const [memberRows] = await pool.execute(
          `SELECT am.*, u.name as user_name, u.role as user_role FROM assignment_members am
           JOIN users u ON am.user_id = u.id WHERE am.assignment_id = ?`,
          [assignment.id]
        );
        assignment.members = memberRows;
      }
    } else {
      assignments = mockStore.assignments.map((a) => {
        const creator = mockStore.users.find((u) => u.id === a.created_by);
        const members = mockStore.assignment_members
          .filter((am) => am.assignment_id === a.id)
          .map((am) => {
            const user = mockStore.users.find((u) => u.id === am.user_id);
            return { ...am, user_name: user?.name, user_role: user?.role };
          });
        return { ...a, created_by_name: creator?.name, members };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('GetAllAssignments error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * GET /api/assignments/my
 * Get assignments for the logged-in staff member.
 */
async function getMyAssignments(req, res) {
  try {
    const userId = req.user.id;
    let assignments = [];

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT a.*, am.role_in_assignment as my_role FROM assignments a
         JOIN assignment_members am ON a.id = am.assignment_id
         WHERE am.user_id = ? ORDER BY a.publication_deadline ASC`,
        [userId]
      );
      assignments = rows;
    } else {
      const myMemberships = mockStore.assignment_members.filter((am) => am.user_id === userId);
      assignments = myMemberships.map((am) => {
        const assignment = mockStore.assignments.find((a) => a.id === am.assignment_id);
        return assignment ? { ...assignment, my_role: am.role_in_assignment } : null;
      }).filter(Boolean).sort((a, b) => new Date(a.publication_deadline) - new Date(b.publication_deadline));
    }

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('GetMyAssignments error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * GET /api/assignments/:id
 * Get single assignment with all details.
 */
async function getAssignmentById(req, res) {
  try {
    const { id } = req.params;
    let assignment = null;

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute('SELECT a.*, u.name as created_by_name FROM assignments a LEFT JOIN users u ON a.created_by = u.id WHERE a.id = ?', [id]);
      assignment = rows[0];
      if (assignment) {
        const [members] = await pool.execute(
          'SELECT am.*, u.name as user_name, u.role as user_role FROM assignment_members am JOIN users u ON am.user_id = u.id WHERE am.assignment_id = ?',
          [id]
        );
        const [evts] = await pool.execute('SELECT * FROM events WHERE assignment_id = ? ORDER BY event_date', [id]);
        const [notes] = await pool.execute(
          'SELECT tn.*, u.name as user_name FROM task_notes tn JOIN users u ON tn.user_id = u.id WHERE tn.assignment_id = ? ORDER BY tn.created_at DESC',
          [id]
        );
        const [logs] = await pool.execute(
          'SELECT al.*, u.name as changed_by_name FROM audit_logs al LEFT JOIN users u ON al.changed_by = u.id WHERE al.assignment_id = ? ORDER BY al.created_at DESC',
          [id]
        );
        assignment.members = members;
        assignment.events = evts;
        assignment.notes = notes;
        assignment.audit_trail = logs;
      }
    } else {
      const found = mockStore.assignments.find((a) => a.id === parseInt(id));
      if (found) {
        const creator = mockStore.users.find((u) => u.id === found.created_by);
        const members = mockStore.assignment_members
          .filter((am) => am.assignment_id === found.id)
          .map((am) => {
            const user = mockStore.users.find((u) => u.id === am.user_id);
            return { ...am, user_name: user?.name, user_role: user?.role };
          });
        const evts = mockStore.events.filter((e) => e.assignment_id === found.id);
        const notes = mockStore.task_notes
          .filter((n) => n.assignment_id === found.id)
          .map((n) => { const u = mockStore.users.find((u) => u.id === n.user_id); return { ...n, user_name: u?.name }; })
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const logs = mockStore.audit_logs
          .filter((l) => l.assignment_id === found.id)
          .map((l) => { const u = mockStore.users.find((u) => u.id === l.changed_by); return { ...l, changed_by_name: u?.name }; })
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        assignment = { ...found, created_by_name: creator?.name, members, events: evts, notes, audit_trail: logs };
      }
    }

    // If staff, verify they are assigned to this assignment
    if (assignment && req.user.role !== 'admin') {
      const isMember = assignment.members?.some((m) => m.user_id === req.user.id);
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Access denied. You are not assigned to this task.', code: 403 });
      }
    }

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.', code: 404 });
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    console.error('GetAssignmentById error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * PUT /api/assignments/:id
 * Update assignment details. Admin only.
 */
async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const { title, description, category, content_type, priority, status, publication_deadline, instructions,
      reporter_id, interviewer_id, photographer_id, editor_id, interview_date, photo_shoot_date } = req.body;

    if (isDatabaseConnected()) {
      const pool = getPool();
      // Get old assignment for audit
      const [oldRows] = await pool.execute('SELECT * FROM assignments WHERE id = ?', [id]);
      if (!oldRows[0]) return res.status(404).json({ success: false, message: 'Assignment not found.', code: 404 });

      await pool.execute(
        `UPDATE assignments SET title=COALESCE(?,title), description=COALESCE(?,description), category=COALESCE(?,category),
         content_type=COALESCE(?,content_type), priority=COALESCE(?,priority), status=COALESCE(?,status),
         publication_deadline=COALESCE(?,publication_deadline), instructions=COALESCE(?,instructions) WHERE id=?`,
        [title, description, category, content_type, priority, status, publication_deadline, instructions, id]
      );

      // Update members if provided
      if (reporter_id || interviewer_id || photographer_id || editor_id) {
        await pool.execute('DELETE FROM assignment_members WHERE assignment_id = ?', [id]);
        const members = [
          { userId: reporter_id, role: 'reporter' },
          { userId: interviewer_id, role: 'interviewer' },
          { userId: photographer_id, role: 'photographer' },
          { userId: editor_id, role: 'editor' },
        ].filter((m) => m.userId);
        for (const m of members) {
          await pool.execute(
            'INSERT INTO assignment_members (assignment_id, user_id, role_in_assignment, assigned_by) VALUES (?, ?, ?, ?)',
            [id, m.userId, m.role, req.user.id]
          );
        }
      }
    } else {
      const assignment = mockStore.assignments.find((a) => a.id === parseInt(id));
      if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.', code: 404 });

      const oldStatus = assignment.status;
      if (title) assignment.title = title;
      if (description) assignment.description = description;
      if (category) assignment.category = category;
      if (content_type) assignment.content_type = content_type;
      if (priority) assignment.priority = priority;
      if (status) assignment.status = status;
      if (publication_deadline) assignment.publication_deadline = publication_deadline;
      if (instructions) assignment.instructions = instructions;
      assignment.updated_at = new Date().toISOString();

      if (reporter_id || interviewer_id || photographer_id || editor_id) {
        // Remove old members for this assignment
        const oldMembers = mockStore.assignment_members.filter((am) => am.assignment_id === parseInt(id));
        for (const om of oldMembers) {
          const idx = mockStore.assignment_members.indexOf(om);
          if (idx > -1) mockStore.assignment_members.splice(idx, 1);
        }
        const newMembers = [
          { userId: reporter_id, role: 'reporter' },
          { userId: interviewer_id, role: 'interviewer' },
          { userId: photographer_id, role: 'photographer' },
          { userId: editor_id, role: 'editor' },
        ].filter((m) => m.userId);
        for (const m of newMembers) {
          mockStore.assignment_members.push({
            id: mockStore.getNextId('assignment_members'),
            assignment_id: parseInt(id), user_id: parseInt(m.userId),
            role_in_assignment: m.role, assigned_by: req.user.id,
            assigned_at: new Date().toISOString(),
          });
        }
      }

      if (status && status !== oldStatus) {
        await logAudit({ assignmentId: parseInt(id), action: 'Status Changed', oldValue: oldStatus, newValue: status, changedBy: req.user.id });
      }
    }

    await logAudit({ assignmentId: parseInt(id), action: 'Assignment Updated', newValue: title || 'Fields updated', changedBy: req.user.id });

    res.json({ success: true, message: 'Assignment updated successfully.' });
  } catch (error) {
    console.error('UpdateAssignment error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * PATCH /api/assignments/:id/status
 * Update assignment status. Both admin and staff (own assignments).
 */
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let oldStatus = '';

    // Staff can only update their own assignments
    if (req.user.role !== 'admin') {
      let isMember = false;
      if (isDatabaseConnected()) {
        const pool = getPool();
        const [rows] = await pool.execute('SELECT id FROM assignment_members WHERE assignment_id = ? AND user_id = ?', [id, req.user.id]);
        isMember = rows.length > 0;
      } else {
        isMember = mockStore.assignment_members.some((am) => am.assignment_id === parseInt(id) && am.user_id === req.user.id);
      }
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this task.', code: 403 });
      }
    }

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute('SELECT status FROM assignments WHERE id = ?', [id]);
      if (!rows[0]) return res.status(404).json({ success: false, message: 'Assignment not found.', code: 404 });
      oldStatus = rows[0].status;
      await pool.execute('UPDATE assignments SET status = ? WHERE id = ?', [status, id]);
    } else {
      const assignment = mockStore.assignments.find((a) => a.id === parseInt(id));
      if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.', code: 404 });
      oldStatus = assignment.status;
      assignment.status = status;
      assignment.updated_at = new Date().toISOString();
    }

    await logAudit({ assignmentId: parseInt(id), action: 'Status Changed', oldValue: oldStatus, newValue: status, changedBy: req.user.id });

    res.json({ success: true, message: 'Status updated successfully.' });
  } catch (error) {
    console.error('UpdateStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * DELETE /api/assignments/:id
 * Delete assignment (only if safe — not completed/in progress). Admin only.
 */
async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;

    let assignment = null;
    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute('SELECT * FROM assignments WHERE id = ?', [id]);
      assignment = rows[0];
    } else {
      assignment = mockStore.assignments.find((a) => a.id === parseInt(id));
    }

    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.', code: 404 });
    if (['In Progress', 'Completed'].includes(assignment.status)) {
      return res.status(400).json({ success: false, message: 'Cannot delete an assignment that is In Progress or Completed. Archive it instead.', code: 400 });
    }

    if (isDatabaseConnected()) {
      const pool = getPool();
      await pool.execute('DELETE FROM assignments WHERE id = ?', [id]);
    } else {
      const idx = mockStore.assignments.findIndex((a) => a.id === parseInt(id));
      if (idx > -1) mockStore.assignments.splice(idx, 1);
      // Clean related mock data
      mockStore.assignment_members = mockStore.assignment_members.filter((am) => am.assignment_id !== parseInt(id));
      mockStore.events = mockStore.events.filter((e) => e.assignment_id !== parseInt(id));
    }

    await logAudit({ assignmentId: parseInt(id), action: 'Assignment Deleted', changedBy: req.user.id });

    res.json({ success: true, message: 'Assignment deleted successfully.' });
  } catch (error) {
    console.error('DeleteAssignment error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

module.exports = { createAssignment, getAllAssignments, getMyAssignments, getAssignmentById, updateAssignment, updateStatus, deleteAssignment };

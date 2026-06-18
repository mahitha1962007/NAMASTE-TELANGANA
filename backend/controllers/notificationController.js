// ============================================
// Notification Controller
// ============================================

const { getPool, isDatabaseConnected } = require('../config/db');
const mockStore = require('../utils/mockData');

/**
 * GET /api/notifications
 * Get notifications for the logged-in user.
 * Admin sees all, staff sees their own.
 */
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    let notifications = [];

    if (isDatabaseConnected()) {
      const pool = getPool();
      let query, params;
      if (isAdmin) {
        query = `SELECT n.*, a.title as assignment_title FROM notifications n
                  LEFT JOIN assignments a ON n.assignment_id = a.id
                  ORDER BY n.created_at DESC LIMIT 50`;
        params = [];
      } else {
        query = `SELECT n.*, a.title as assignment_title FROM notifications n
                  LEFT JOIN assignments a ON n.assignment_id = a.id
                  WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 50`;
        params = [userId];
      }
      const [rows] = await pool.execute(query, params);
      notifications = rows;
    } else {
      let filtered = isAdmin ? [...mockStore.notifications] : mockStore.notifications.filter((n) => n.user_id === userId);
      notifications = filtered
        .map((n) => {
          const assignment = mockStore.assignments.find((a) => a.id === n.assignment_id);
          return { ...n, assignment_title: assignment?.title || null };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 50);
    }

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('GetNotifications error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read.
 */
async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      const pool = getPool();
      await pool.execute('UPDATE notifications SET is_read = true WHERE id = ?', [id]);
    } else {
      const notif = mockStore.notifications.find((n) => n.id === parseInt(id));
      if (notif) notif.is_read = true;
    }

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('MarkAsRead error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

module.exports = { getNotifications, markAsRead };

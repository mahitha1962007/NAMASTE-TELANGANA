// ============================================
// Notification Helper
// ============================================
// Creates notification entries for staff members.

const { getPool, isDatabaseConnected } = require('../config/db');
const mockStore = require('./mockData');

/**
 * Create a notification for a specific user.
 * @param {Object} params
 * @param {number} params.userId - Target user ID
 * @param {number|null} params.assignmentId - Related assignment ID
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type (new_assignment, deadline_near, etc.)
 */
async function createNotification({ userId, assignmentId = null, message, type }) {
  const now = new Date().toISOString();

  if (isDatabaseConnected()) {
    const pool = getPool();
    await pool.execute(
      'INSERT INTO notifications (user_id, assignment_id, message, type) VALUES (?, ?, ?, ?)',
      [userId, assignmentId, message, type]
    );
  } else {
    const id = mockStore.getNextId('notifications');
    mockStore.notifications.push({
      id,
      user_id: userId,
      assignment_id: assignmentId,
      message,
      type,
      is_read: false,
      created_at: now,
    });
  }
}

/**
 * Create notifications for multiple users at once.
 * @param {Array<Object>} notificationList - Array of notification param objects
 */
async function createBulkNotifications(notificationList) {
  for (const notif of notificationList) {
    await createNotification(notif);
  }
}

module.exports = { createNotification, createBulkNotifications };

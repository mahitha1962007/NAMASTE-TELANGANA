// ============================================
// Event Controller
// ============================================

const { getPool, isDatabaseConnected } = require('../config/db');
const mockStore = require('../utils/mockData');

/**
 * GET /api/events
 * Get all events. Admin only.
 */
async function getAllEvents(req, res) {
  try {
    let events = [];
    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT e.*, 
                a.title as assignment_title, 
                a.status as assignment_status, 
                a.priority as assignment_priority,
                a.content_type, 
                a.category, 
                a.description, 
                a.publication_deadline,
                u.name as assigned_to_name,
                c.name as created_by_name
         FROM events e
         LEFT JOIN assignments a ON e.assignment_id = a.id
         LEFT JOIN users u ON e.assigned_to = u.id
         LEFT JOIN users c ON a.created_by = c.id
         ORDER BY e.event_date ASC`
      );
      events = rows;
    } else {
      events = mockStore.events.map((e) => {
        const assignment = mockStore.assignments.find((a) => a.id === e.assignment_id);
        const user = mockStore.users.find((u) => u.id === e.assigned_to);
        const creator = assignment ? mockStore.users.find((u) => u.id === assignment.created_by) : null;
        return {
          ...e,
          assignment_title: assignment?.title,
          assignment_status: assignment?.status || 'Assigned',
          assignment_priority: assignment?.priority || 'Medium',
          content_type: assignment?.content_type || 'News Article',
          category: assignment?.category || 'General',
          description: assignment?.description || '',
          publication_deadline: assignment?.publication_deadline || e.event_date,
          assigned_to_name: user?.name,
          created_by_name: creator?.name || 'Admin User'
        };
      }).sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    }
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('GetAllEvents error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * GET /api/events/my
 * Get events assigned to the logged-in user.
 */
async function getMyEvents(req, res) {
  try {
    const userId = req.user.id;
    let events = [];
    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT e.*, 
                a.title as assignment_title, 
                a.status as assignment_status, 
                a.priority as assignment_priority,
                a.content_type, 
                a.category, 
                a.description, 
                a.publication_deadline,
                c.name as created_by_name
         FROM events e
         LEFT JOIN assignments a ON e.assignment_id = a.id
         LEFT JOIN users c ON a.created_by = c.id
         WHERE e.assigned_to = ? ORDER BY e.event_date ASC`,
        [userId]
      );
      events = rows;
    } else {
      events = mockStore.events
        .filter((e) => e.assigned_to === userId)
        .map((e) => {
          const assignment = mockStore.assignments.find((a) => a.id === e.assignment_id);
          const creator = assignment ? mockStore.users.find((u) => u.id === assignment.created_by) : null;
          return {
            ...e,
            assignment_title: assignment?.title,
            assignment_status: assignment?.status || 'Assigned',
            assignment_priority: assignment?.priority || 'Medium',
            content_type: assignment?.content_type || 'News Article',
            category: assignment?.category || 'General',
            description: assignment?.description || '',
            publication_deadline: assignment?.publication_deadline || e.event_date,
            created_by_name: creator?.name || 'Admin User'
          };
        })
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    }
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('GetMyEvents error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * POST /api/events
 * Create a new event. Admin only.
 */
async function createEvent(req, res) {
  try {
    const { assignment_id, event_type, title, event_date, location, assigned_to } = req.body;
    let eventId;

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [result] = await pool.execute(
        'INSERT INTO events (assignment_id, event_type, title, event_date, location, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
        [assignment_id, event_type, title, event_date, location, assigned_to]
      );
      eventId = result.insertId;
    } else {
      eventId = mockStore.getNextId('events');
      mockStore.events.push({
        id: eventId, assignment_id, event_type, title, event_date,
        location: location || null, assigned_to: assigned_to || null,
        status: 'Scheduled', created_at: new Date().toISOString(),
      });
    }

    res.status(201).json({ success: true, message: 'Event created.', data: { id: eventId } });
  } catch (error) {
    console.error('CreateEvent error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * PATCH /api/events/:id/status
 * Update event status.
 */
async function updateEventStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isDatabaseConnected()) {
      const pool = getPool();
      await pool.execute('UPDATE events SET status = ? WHERE id = ?', [status, id]);
    } else {
      const event = mockStore.events.find((e) => e.id === parseInt(id));
      if (!event) return res.status(404).json({ success: false, message: 'Event not found.', code: 404 });
      event.status = status;
    }

    res.json({ success: true, message: 'Event status updated.' });
  } catch (error) {
    console.error('UpdateEventStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

module.exports = { getAllEvents, getMyEvents, createEvent, updateEventStatus };

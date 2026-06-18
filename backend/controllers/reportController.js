// ============================================
// Report Controller
// ============================================
// Generates dashboard analytics and report data.

const { getPool, isDatabaseConnected } = require('../config/db');
const mockStore = require('../utils/mockData');
const { calcCompletionPercentage, isOverdue, isWithinDays } = require('../utils/deadlineHelper');

/**
 * GET /api/reports/summary
 * Overall summary stats for admin dashboard.
 */
async function getSummary(req, res) {
  try {
    let total = 0, assigned = 0, inProgress = 0, completed = 0, delayed = 0, archived = 0;

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT status, COUNT(*) as count FROM assignments GROUP BY status`
      );
      for (const r of rows) {
        total += r.count;
        if (r.status === 'Assigned') assigned = r.count;
        if (r.status === 'In Progress') inProgress = r.count;
        if (r.status === 'Completed') completed = r.count;
        if (r.status === 'Delayed') delayed = r.count;
        if (r.status === 'Archived') archived = r.count;
      }
    } else {
      const all = mockStore.assignments;
      total = all.length;
      assigned = all.filter((a) => a.status === 'Assigned').length;
      inProgress = all.filter((a) => a.status === 'In Progress').length;
      completed = all.filter((a) => a.status === 'Completed').length;
      delayed = all.filter((a) => a.status === 'Delayed').length;
      archived = all.filter((a) => a.status === 'Archived').length;
    }

    // Count today's events
    const todayStr = new Date().toISOString().split('T')[0];
    let todayInterviews = 0, todayPhotoShoots = 0;

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [iRows] = await pool.execute(`SELECT COUNT(*) as c FROM events WHERE event_type='Interview' AND DATE(event_date)=CURDATE()`);
      const [pRows] = await pool.execute(`SELECT COUNT(*) as c FROM events WHERE event_type='Photo Shoot' AND DATE(event_date)=CURDATE()`);
      todayInterviews = iRows[0].c;
      todayPhotoShoots = pRows[0].c;
    } else {
      todayInterviews = mockStore.events.filter((e) => e.event_type === 'Interview' && e.event_date.startsWith(todayStr)).length;
      todayPhotoShoots = mockStore.events.filter((e) => e.event_type === 'Photo Shoot' && e.event_date.startsWith(todayStr)).length;
    }

    // Upcoming deadlines (next 7 days)
    let upcomingDeadlines = 0;
    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as c FROM assignments WHERE status NOT IN ('Completed','Archived') AND publication_deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)`
      );
      upcomingDeadlines = rows[0].c;
    } else {
      upcomingDeadlines = mockStore.assignments.filter(
        (a) => !['Completed', 'Archived'].includes(a.status) && isWithinDays(a.publication_deadline, 7)
      ).length;
    }

    res.json({
      success: true,
      data: {
        total, assigned, in_progress: inProgress, completed, delayed, archived,
        completion_percentage: calcCompletionPercentage(completed, total),
        today_interviews: todayInterviews,
        today_photo_shoots: todayPhotoShoots,
        upcoming_deadlines: upcomingDeadlines,
      },
    });
  } catch (error) {
    console.error('GetSummary error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * GET /api/reports/status-count
 * Status-wise assignment counts for pie chart.
 */
async function getStatusCount(req, res) {
  try {
    let data = [];
    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute('SELECT status as name, COUNT(*) as value FROM assignments GROUP BY status');
      data = rows;
    } else {
      const counts = {};
      mockStore.assignments.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });
      data = Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('GetStatusCount error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * GET /api/reports/category-count
 * Category-wise assignment counts for bar chart.
 */
async function getCategoryCount(req, res) {
  try {
    let data = [];
    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute('SELECT COALESCE(category, "Uncategorized") as name, COUNT(*) as value FROM assignments GROUP BY category');
      data = rows;
    } else {
      const counts = {};
      mockStore.assignments.forEach((a) => { const cat = a.category || 'Uncategorized'; counts[cat] = (counts[cat] || 0) + 1; });
      data = Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('GetCategoryCount error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * GET /api/reports/staff-workload
 * Active task count per staff member.
 */
async function getStaffWorkload(req, res) {
  try {
    let data = [];
    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT u.name, u.role, COUNT(am.id) as active_tasks
         FROM users u LEFT JOIN assignment_members am ON u.id = am.user_id
         LEFT JOIN assignments a ON am.assignment_id = a.id AND a.status NOT IN ('Completed','Archived')
         WHERE u.role != 'admin' AND u.is_active = true
         GROUP BY u.id ORDER BY active_tasks DESC`
      );
      data = rows;
    } else {
      data = mockStore.users.filter((u) => u.role !== 'admin' && u.is_active).map((u) => {
        const ids = mockStore.assignment_members.filter((am) => am.user_id === u.id).map((am) => am.assignment_id);
        const active = mockStore.assignments.filter((a) => ids.includes(a.id) && !['Completed', 'Archived'].includes(a.status)).length;
        return { name: u.name, role: u.role, active_tasks: active };
      }).sort((a, b) => b.active_tasks - a.active_tasks);
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('GetStaffWorkload error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * GET /api/reports/deadlines
 * Upcoming and overdue deadlines.
 */
async function getDeadlines(req, res) {
  try {
    let upcoming = [], overdue = [];

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [upRows] = await pool.execute(
        `SELECT a.id, a.title, a.priority, a.status, a.publication_deadline
         FROM assignments a WHERE a.status NOT IN ('Completed','Archived')
         AND a.publication_deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) ORDER BY a.publication_deadline ASC`
      );
      const [odRows] = await pool.execute(
        `SELECT a.id, a.title, a.priority, a.status, a.publication_deadline
         FROM assignments a WHERE a.status NOT IN ('Completed','Archived')
         AND a.publication_deadline < NOW() ORDER BY a.publication_deadline ASC`
      );
      upcoming = upRows;
      overdue = odRows;
    } else {
      const active = mockStore.assignments.filter((a) => !['Completed', 'Archived'].includes(a.status));
      upcoming = active.filter((a) => isWithinDays(a.publication_deadline, 7)).sort((a, b) => new Date(a.publication_deadline) - new Date(b.publication_deadline));
      overdue = active.filter((a) => isOverdue(a.publication_deadline)).sort((a, b) => new Date(a.publication_deadline) - new Date(b.publication_deadline));
    }

    res.json({ success: true, data: { upcoming, overdue } });
  } catch (error) {
    console.error('GetDeadlines error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

module.exports = { getSummary, getStatusCount, getCategoryCount, getStaffWorkload, getDeadlines };

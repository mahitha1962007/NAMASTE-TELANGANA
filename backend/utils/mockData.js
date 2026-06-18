// ============================================
// Mock Data Store
// ============================================
// In-memory database substitute for MOCK_MODE.
// Provides realistic sample data that persists during server session.
// Data resets when server restarts.

const bcrypt = require('bcryptjs');

// Pre-hashed passwords for mock users (generated at module load)
let passwordHashAdmin = '';
let passwordHashStaff = '';

// Auto-increment counters
let counters = {
  users: 5,
  assignments: 0,
  assignment_members: 0,
  events: 0,
  notifications: 0,
  audit_logs: 0,
  task_notes: 0,
};

// ---- Mock Data Tables ----

const users = [];
const assignments = [];
const assignment_members = [];
const events = [];
const notifications = [];
const audit_logs = [];
const task_notes = [];

/**
 * Initialize mock data with bcrypt-hashed passwords.
 * Called once at server startup.
 */
async function initializeMockData() {
  passwordHashAdmin = await bcrypt.hash('Admin@123', 10);
  passwordHashStaff = await bcrypt.hash('Staff@123', 10);

  const now = new Date().toISOString();
  const today = new Date();

  // Seed Users
  users.length = 0;
  users.push(
    { id: 1, name: 'Admin User', email: 'admin@example.com', password_hash: passwordHashAdmin, role: 'admin', department: 'Management', phone: '9876543210', is_active: true, created_at: now, updated_at: now },
    { id: 2, name: 'Ravi Kumar', email: 'reporter@example.com', password_hash: passwordHashStaff, role: 'reporter', department: 'News Desk', phone: '9876543211', is_active: true, created_at: now, updated_at: now },
    { id: 3, name: 'Kiran Reddy', email: 'photographer@example.com', password_hash: passwordHashStaff, role: 'photographer', department: 'Media', phone: '9876543212', is_active: true, created_at: now, updated_at: now },
    { id: 4, name: 'Anjali Sharma', email: 'editor@example.com', password_hash: passwordHashStaff, role: 'editor', department: 'Editorial', phone: '9876543213', is_active: true, created_at: now, updated_at: now },
    { id: 5, name: 'Suresh Babu', email: 'interviewer@example.com', password_hash: passwordHashStaff, role: 'interviewer', department: 'News Desk', phone: '9876543214', is_active: true, created_at: now, updated_at: now }
  );

  // Empty lists for new, clean start state
  assignments.length = 0;
  assignment_members.length = 0;
  events.length = 0;
  notifications.length = 0;
  audit_logs.length = 0;
  task_notes.length = 0;

  console.log('📦 Mock data initialized with', users.length, 'users, 0 assignments.');
}

// ---- Data Access Helpers ----

function getNextId(table) {
  counters[table] = (counters[table] || 0) + 1;
  return counters[table];
}

// ---- Exported Mock Store ----
const mockStore = {
  users,
  assignments,
  assignment_members,
  events,
  notifications,
  audit_logs,
  task_notes,
  getNextId,
  initializeMockData,
};

module.exports = mockStore;

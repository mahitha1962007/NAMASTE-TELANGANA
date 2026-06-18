// ============================================
// Database Clean/Truncate Script
// ============================================
// Clears all user-created data (assignments, events, notes, logs, notifications)
// but PRESERVES the users table so login still works.
// Run: node migrations/clearData.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function clearData() {
  console.log('🧹 Starting database cleanup...');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway',
    port: parseInt(process.env.DB_PORT) || 3306,
  });

  try {
    // Disable foreign key checks to truncate safely
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');

    // Truncate tables
    const tables = ['task_notes', 'audit_logs', 'notifications', 'events', 'assignment_members', 'assignments'];
    for (const table of tables) {
      try {
        await pool.query(`TRUNCATE TABLE ${table}`);
        console.log(`  ✅ Cleared table: ${table}`);
      } catch (err) {
        console.warn(`  ⚠️ Could not truncate table ${table}:`, err.message);
      }
    }

    // Re-enable foreign key checks
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n🧹 Database cleared successfully! (User profiles preserved).');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

clearData();

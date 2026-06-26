// ============================================
// Database Migration Runner
// ============================================
// Reads schema.sql and executes it against the MySQL database.
// Only runs when MOCK_MODE=false and database is connected.

const fs = require('fs');
const path = require('path');
const { getPool, isDatabaseConnected } = require('../config/db');

async function runMigrations() {
  if (!isDatabaseConnected()) {
    console.log('⏭️  Skipping migrations (not connected to database).');
    return;
  }

  try {
    let schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    }

    if (!fs.existsSync(schemaPath)) {
      console.log('⏭️  schema.sql not found. Skipping migrations. Resolved path tried: ' + schemaPath);
      return;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    const pool = getPool();

    // Strip comments first, then split by semicolons
    const cleanSchema = schema
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('--'))
      .join('\n');

    const statements = cleanSchema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
          console.warn('Migration warning:', err.message);
        }
      }
    }

    console.log('✅ Database migrations completed.');

    // Auto-seed if users table is empty
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
      if (rows[0] && rows[0].count === 0) {
        console.log('🌱 Database is empty. Auto-seeding default admin and staff users...');
        const bcrypt = require('bcryptjs');
        const adminHash = await bcrypt.hash('Admin@123', 10);
        const staffHash = await bcrypt.hash('Staff@123', 10);

        const users = [
          ['Admin User', 'admin@example.com', adminHash, 'admin', 'Management', '9876543210'],
          ['Ravi Kumar', 'reporter@example.com', staffHash, 'reporter', 'News Desk', '9876543211'],
          ['Kiran Reddy', 'photographer@example.com', staffHash, 'photographer', 'Media', '9876543212'],
          ['Anjali Sharma', 'editor@example.com', staffHash, 'editor', 'Editorial', '9876543213'],
          ['Suresh Babu', 'interviewer@example.com', staffHash, 'interviewer', 'News Desk', '9876543214'],
        ];

        for (const user of users) {
          await pool.query(
            'INSERT INTO users (name, email, password_hash, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)',
            user
          );
          console.log(`  ✅ Seeded user: ${user[0]} (${user[3]})`);
        }

        console.log('✅ Default users auto-seeded.');
      }
    } catch (seedErr) {
      console.warn('⚠️ Auto-seeding warning:', seedErr.message);
    }
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
}

module.exports = runMigrations;

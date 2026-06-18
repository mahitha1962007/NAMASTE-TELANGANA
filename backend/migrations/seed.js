// ============================================
// Database Seeder
// ============================================
// Seeds the MySQL database with initial users and sample data.
// Passwords are hashed with bcrypt at runtime.
// Run: node migrations/seed.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function seed() {
  console.log('🌱 Starting database seeder...');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'editorial_content_planner',
    port: parseInt(process.env.DB_PORT) || 3306,
  });

  try {
    // Hash passwords
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const staffHash = await bcrypt.hash('Staff@123', 10);

    // Seed users
    const users = [
      ['Admin User', 'admin@example.com', adminHash, 'admin', 'Management', '9876543210'],
      ['Ravi Kumar', 'reporter@example.com', staffHash, 'reporter', 'News Desk', '9876543211'],
      ['Kiran Reddy', 'photographer@example.com', staffHash, 'photographer', 'Media', '9876543212'],
      ['Anjali Sharma', 'editor@example.com', staffHash, 'editor', 'Editorial', '9876543213'],
      ['Suresh Babu', 'interviewer@example.com', staffHash, 'interviewer', 'News Desk', '9876543214'],
    ];

    for (const user of users) {
      try {
        await pool.execute(
          'INSERT INTO users (name, email, password_hash, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)',
          user
        );
        console.log(`  ✅ Created user: ${user[0]} (${user[3]})`);
      } catch (err) {
        if (err.message.includes('Duplicate')) {
          console.log(`  ⏭️  User already exists: ${user[1]}`);
        } else {
          throw err;
        }
      }
    }

    // Seed sample assignments
    const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 19).replace('T', ' '); };

    const assignments = [
      ['Telangana Education Policy Update', 'Cover the new education policy announcement.', 'Politics', 'News Article', 'High', 'Assigned', addDays(5), 'Interview the Education Minister.', 1],
      ['Hyderabad Metro Expansion Report', 'Report on metro line expansion plans.', 'Infrastructure', 'Feature Story', 'Medium', 'In Progress', addDays(7), 'Visit the construction site.', 1],
      ['Bathukamma Festival Coverage', 'Annual Bathukamma festival cultural coverage.', 'Culture', 'Photo Story', 'High', 'Assigned', addDays(3), 'Capture celebrations in 3 districts.', 1],
    ];

    for (const assignment of assignments) {
      try {
        await pool.execute(
          `INSERT INTO assignments (title, description, category, content_type, priority, status, publication_deadline, instructions, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          assignment
        );
        console.log(`  ✅ Created assignment: ${assignment[0]}`);
      } catch (err) {
        console.log(`  ⚠️  Assignment insert issue: ${err.message}`);
      }
    }

    console.log('\n🌱 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seed();

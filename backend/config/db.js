// ============================================
// Editorial Content Calendar & Publication Planner
// Database Configuration
// ============================================
// Connects to MySQL when MOCK_MODE=false.
// Falls back gracefully without crashing if DB is unreachable.

const mysql = require('mysql2/promise');

let pool = null;
let isConnected = false;

/**
 * Initialize the MySQL connection pool.
 * Only attempts connection when MOCK_MODE is not 'true'.
 * Returns the pool or null if connection fails.
 */
async function initializeDatabase() {
  if (process.env.MOCK_MODE === 'true') {
    console.log('📦 MOCK_MODE is enabled. Skipping database connection.');
    return null;
  }

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
      database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'editorial_content_planner',
      port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully.');
    isConnected = true;
    connection.release();
    return pool;
  } catch (error) {
    console.error('⚠️  MySQL connection failed:', error.message);
    console.log('📦 Falling back to MOCK_MODE. Set MOCK_MODE=false and fix DB credentials to use MySQL.');
    pool = null;
    isConnected = false;
    return null;
  }
}

/**
 * Get the current database pool.
 * Returns null if not connected (mock mode or connection failure).
 */
function getPool() {
  return pool;
}

/**
 * Check if the database is currently connected.
 */
function isDatabaseConnected() {
  return isConnected;
}

module.exports = { initializeDatabase, getPool, isDatabaseConnected };

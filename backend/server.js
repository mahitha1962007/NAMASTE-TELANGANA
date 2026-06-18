// ============================================
// Editorial Content Calendar & Publication Planner
// Backend Server Entry Point
// ============================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initializeDatabase } = require('./config/db');
const mockStore = require('./utils/mockData');
const runMigrations = require('./migrations/runMigrations');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/errorMiddleware');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Health Check ----
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Editorial Content Planner API is running.',
    mode: process.env.MOCK_MODE === 'true' ? 'MOCK' : 'DATABASE',
    timestamp: new Date().toISOString(),
  });
});

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/assignments', assignmentRoutes);
// Note routes are mounted on /api/assignments/:id/notes path
app.use('/api/assignments', noteRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// ---- Error Handling ----
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// ---- Server Startup ----
async function startServer() {
  console.log('============================================');
  console.log('  Editorial Content Calendar & Publication Planner');
  console.log('  Backend Server Starting...');
  console.log('============================================');

  // Initialize database or mock data
  await initializeDatabase();

  if (process.env.MOCK_MODE === 'true' || !require('./config/db').isDatabaseConnected()) {
    // Initialize in-memory mock data
    await mockStore.initializeMockData();
    console.log('📦 Running in MOCK MODE with sample data.');
  } else {
    // Run database migrations
    await runMigrations();
    console.log('🗄️  Running with MySQL database.');
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 API Base: http://localhost:${PORT}/api`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log(`📦 Mode: ${process.env.MOCK_MODE === 'true' ? 'MOCK' : 'DATABASE'}`);
    console.log('============================================\n');
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// ============================================================================
// EXPRESS.JS SERVER - Patient Management System API
// ============================================================================
// Main server file that sets up Express app and routes
// ============================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const patientsRoutes = require('./routes/patients');
const doctorsRoutes = require('./routes/doctors');
const appointmentsRoutes = require('./routes/appointments');

// ============================================================================
// INITIALIZE APP
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3001;

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  Patient Management System - Express.js API           ║');
console.log('║  ⚠️  IN-MEMORY MODE - Data will be lost on restart    ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS - Allow requests from React frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// INITIALIZE DATABASE
// ============================================================================

initializeDatabase();

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Patient Management System API',
    version: '1.0.0',
    endpoints: {
      patients: '/api/patients',
      doctors: '/api/doctors',
      appointments: '/api/appointments'
    }
  });
});

// Register API routes
app.use('/api/patients', patientsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET    /api/patients`);
  console.log(`   POST   /api/patients`);
  console.log(`   GET    /api/patients/:id`);
  console.log(`   PUT    /api/patients/:id`);
  console.log(`   DELETE /api/patients/:id`);
  console.log(`   `);
  console.log(`   GET    /api/doctors`);
  console.log(`   POST   /api/doctors`);
  console.log(`   GET    /api/doctors/:id`);
  console.log(`   PUT    /api/doctors/:id`);
  console.log(`   DELETE /api/doctors/:id`);
  console.log(`   `);
  console.log(`   GET    /api/appointments`);
  console.log(`   POST   /api/appointments`);
  console.log(`   GET    /api/appointments/:id`);
  console.log(`   PUT    /api/appointments/:id`);
  console.log(`   DELETE /api/appointments/:id`);
  console.log(`\n💡 Press Ctrl+C to stop the server\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
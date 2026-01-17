// ============================================================================
// DATABASE CONFIGURATION - Initializes and configures the RDBMS
// ============================================================================
// This file sets up the database connection and creates tables
// IN-MEMORY VERSION (no persistence)
// ============================================================================

const { Database, SQLParser } = require('../../rdbms');

// Singleton pattern - only one database instance
let dbInstance = null;
let parserInstance = null;

/**
 * Initializes the database with tables
 * @returns {Object} { db, parser }
 */
function initializeDatabase() {
  if (dbInstance) {
    // Return existing instance
    return { db: dbInstance, parser: parserInstance };
  }

  console.log('🔧 Initializing in-memory database...');

  // Create database instance
  const db = new Database(process.env.DB_NAME || 'patient_management');
  const parser = new SQLParser(db);

  // Create tables
  console.log('📋 Creating tables...');
  createTables(parser);

  // Store instances
  dbInstance = db;
  parserInstance = parser;

  console.log('✅ Database ready!\n');

  return { db, parser };
}

/**
 * Creates the initial table structure
 * @param {SQLParser} parser - SQL parser instance
 */
function createTables(parser) {
  console.log('Creating tables...');

  // Create patients table
  parser.execute(`
    CREATE TABLE patients (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      date_of_birth DATE,
      created_at TEXT
    )
  `);
  console.log('✓ Created patients table');

  // Create doctors table
  parser.execute(`
    CREATE TABLE doctors (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      years_experience INTEGER
    )
  `);
  console.log('✓ Created doctors table');

  // Create appointments table
  parser.execute(`
    CREATE TABLE appointments (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      appointment_date DATE NOT NULL,
      reason TEXT,
      status TEXT NOT NULL
    )
  `);
  console.log('✓ Created appointments table');
}

/**
 * Gets the database instance
 * @returns {Database} Database instance
 */
function getDatabase() {
  if (!dbInstance) {
    initializeDatabase();
  }
  return dbInstance;
}

/**
 * Gets the SQL parser instance
 * @returns {SQLParser} Parser instance
 */
function getParser() {
  if (!parserInstance) {
    initializeDatabase();
  }
  return parserInstance;
}

/**
 * Resets the database (useful for testing)
 */
function resetDatabase() {
  if (dbInstance) {
    dbInstance.clear();
    createTables(parserInstance);
    console.log('✓ Database reset');
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  getParser,
  resetDatabase
};
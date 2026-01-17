const { Database, SQLParser } = require('../../rdbms');

let dbInstance = null;
let parserInstance = null;

function initializeDatabase() {
  if (dbInstance) {
    return { db: dbInstance, parser: parserInstance };
  }

  console.log('🔧 Initializing in-memory database...');

  const db = new Database(process.env.DB_NAME || 'patient_management');
  const parser = new SQLParser(db);

  console.log('📋 Creating tables...');
  createTables(parser);

  dbInstance = db;
  parserInstance = parser;

  console.log('✅ Database ready!\n');

  return { db, parser };
}

function createTables(parser) {
  console.log('Creating tables...');

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

function getDatabase() {
  if (!dbInstance) {
    initializeDatabase();
  }
  return dbInstance;
}

function getParser() {
  if (!parserInstance) {
    initializeDatabase();
  }
  return parserInstance;
}

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
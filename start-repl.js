// ============================================================================
// REPL STARTER WITH PATIENT MANAGEMENT SCHEMA
// ============================================================================
// This version starts the REPL with the patient management tables pre-created
// So you can immediately start inserting and querying data!
// ============================================================================

const { Database, REPL, SQLParser } = require('./rdbms');

console.log('Initializing Patient Management System...\n');

// Create database
const db = new Database('patient_management');
const parser = new SQLParser(db);

// Create the three tables
console.log('📋 Creating tables...');

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
console.log('✓ Created "patients" table');

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
console.log('✓ Created "doctors" table');

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
console.log('✓ Created "appointments" table\n');

console.log('💡 TIP: Tables are ready! Try these commands:');
console.log('   SHOW TABLES;');
console.log('   INSERT INTO patients (name, email) VALUES (\'John Doe\', \'john@email.com\');');
console.log('   SELECT * FROM patients;');
console.log('   .help for more commands\n');

// Start the REPL with pre-created tables
const repl = new REPL(db);
repl.start();
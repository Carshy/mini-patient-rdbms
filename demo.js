// ============================================================================
// PATIENT MANAGEMENT SYSTEM - DEMONSTRATION
// ============================================================================
// This demo shows how to use the RDBMS to build a patient management system
// It creates three tables: patients, doctors, and appointments
// Then demonstrates all CRUD operations and JOIN queries
// ============================================================================

const { Database, SQLParser } = require('./rdbms');

function runDemo() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Patient Management System - Database Demo            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Create database and parser
  const db = new Database('patient_management');
  const parser = new SQLParser(db);

  console.log('📋 STEP 1: Creating Tables...\n');

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

  console.log('📋 STEP 2: Viewing Table Structures...\n');
  
  console.log('Patients Table:');
  let result = parser.execute('SHOW COLUMNS FROM patients');
  console.table(result.results);

  console.log('Doctors Table:');
  result = parser.execute('SHOW COLUMNS FROM doctors');
  console.table(result.results);

  console.log('Appointments Table:');
  result = parser.execute('SHOW COLUMNS FROM appointments');
  console.table(result.results);

  console.log('📋 STEP 3: Inserting Sample Data...\n');

  // Insert patients
  parser.execute(`
    INSERT INTO patients (name, email, phone, date_of_birth, created_at)
    VALUES ('John Doe', 'john.doe@email.com', '555-0101', '1985-03-15', '2025-01-01')
  `);
  parser.execute(`
    INSERT INTO patients (name, email, phone, date_of_birth, created_at)
    VALUES ('Jane Smith', 'jane.smith@email.com', '555-0102', '1990-07-22', '2025-01-02')
  `);
  parser.execute(`
    INSERT INTO patients (name, email, phone, date_of_birth, created_at)
    VALUES ('Bob Johnson', 'bob.j@email.com', '555-0103', '1978-11-30', '2025-01-03')
  `);
  console.log('✓ Inserted 3 patients');

  // Insert doctors
  parser.execute(`
    INSERT INTO doctors (name, specialty, email, phone, years_experience)
    VALUES ('Dr. Sarah Williams', 'Cardiology', 'dr.williams@hospital.com', '555-1001', 15)
  `);
  parser.execute(`
    INSERT INTO doctors (name, specialty, email, phone, years_experience)
    VALUES ('Dr. Michael Chen', 'Pediatrics', 'dr.chen@hospital.com', '555-1002', 8)
  `);
  parser.execute(`
    INSERT INTO doctors (name, specialty, email, phone, years_experience)
    VALUES ('Dr. Emily Brown', 'General Practice', 'dr.brown@hospital.com', '555-1003', 12)
  `);
  console.log('✓ Inserted 3 doctors');

  // Insert appointments
  parser.execute(`
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
    VALUES (1, 1, '2025-01-15', 'Annual checkup', 'scheduled')
  `);
  parser.execute(`
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
    VALUES (2, 2, '2025-01-16', 'Flu symptoms', 'scheduled')
  `);
  parser.execute(`
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
    VALUES (1, 3, '2025-01-20', 'Follow-up consultation', 'scheduled')
  `);
  parser.execute(`
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
    VALUES (3, 1, '2025-01-18', 'Heart palpitations', 'completed')
  `);
  console.log('✓ Inserted 4 appointments\n');

  console.log('📋 STEP 4: Running SELECT Queries...\n');

  console.log('All Patients:');
  result = parser.execute('SELECT * FROM patients');
  console.table(result.results);

  console.log('All Doctors:');
  result = parser.execute('SELECT * FROM doctors');
  console.table(result.results);

  console.log('Scheduled Appointments Only:');
  result = parser.execute("SELECT * FROM appointments WHERE status = 'scheduled'");
  console.table(result.results);

  console.log('Doctors with 10+ Years Experience:');
  result = parser.execute('SELECT name, specialty, years_experience FROM doctors WHERE years_experience >= 10');
  console.table(result.results);

  console.log('📋 STEP 5: Demonstrating JOIN Operations...\n');

  console.log('Appointments with Patient Details (INNER JOIN):');
  result = parser.execute(`
    SELECT * FROM appointments 
    INNER JOIN patients ON appointments.patient_id = patients.id
  `);
  console.table(result.results);

  console.log('Appointments with Doctor Details (INNER JOIN):');
  result = parser.execute(`
    SELECT * FROM appointments 
    INNER JOIN doctors ON appointments.doctor_id = doctors.id
  `);
  console.table(result.results);

  console.log('📋 STEP 6: Demonstrating UPDATE Operation...\n');

  console.log('Before Update:');
  result = parser.execute('SELECT * FROM appointments WHERE id = 1');
  console.table(result.results);

  parser.execute("UPDATE appointments SET status = 'completed' WHERE id = 1");
  
  console.log('After Update:');
  result = parser.execute('SELECT * FROM appointments WHERE id = 1');
  console.table(result.results);

  console.log('📋 STEP 7: Testing Constraints...\n');

  console.log('Attempting to insert duplicate email (should fail):');
  try {
    parser.execute(`
      INSERT INTO patients (name, email, phone, date_of_birth, created_at)
      VALUES ('Test User', 'john.doe@email.com', '555-9999', '1995-01-01', '2025-01-10')
    `);
  } catch (error) {
    console.log(`✓ Constraint enforced: ${error.message}\n`);
  }

  console.log('Attempting to insert NULL into NOT NULL column (should fail):');
  try {
    parser.execute(`
      INSERT INTO patients (name, email, phone, date_of_birth, created_at)
      VALUES (NULL, 'test@email.com', '555-9999', '1995-01-01', '2025-01-10')
    `);
  } catch (error) {
    console.log(`✓ Constraint enforced: ${error.message}\n`);
  }

  console.log('📋 STEP 8: Demonstrating DELETE Operation...\n');

  console.log('Before Delete:');
  result = parser.execute('SELECT * FROM appointments');
  console.log(`Total appointments: ${result.count}`);

  parser.execute("DELETE FROM appointments WHERE status = 'completed'");
  
  console.log('\nAfter Delete:');
  result = parser.execute('SELECT * FROM appointments');
  console.log(`Total appointments: ${result.count}`);
  console.table(result.results);

  console.log('📋 STEP 9: Advanced Queries...\n');

  console.log('Doctors Sorted by Experience (Descending):');
  result = parser.execute('SELECT name, specialty, years_experience FROM doctors ORDER BY years_experience DESC');
  console.table(result.results);

  console.log('Patients with Names Starting with "J" (LIKE):');
  result = parser.execute("SELECT name, email FROM patients WHERE name LIKE 'J'");
  console.table(result.results);

  console.log('First 2 Patients (LIMIT):');
  result = parser.execute('SELECT name, email FROM patients LIMIT 2');
  console.table(result.results);

  console.log('📋 STEP 10: Database Statistics...\n');

  const stats = db.getStats();
  console.log('Database Statistics:');
  console.log(`  • Database Name: ${stats.name}`);
  console.log(`  • Total Tables: ${stats.tableCount}`);
  console.log(`  • Total Rows: ${stats.totalRows}`);
  console.log(`  • Created At: ${stats.createdAt.toLocaleString()}\n`);

  console.log('Table Details:');
  stats.tables.forEach(table => {
    console.log(`  • ${table.name}:`);
    console.log(`    - Rows: ${table.rows}`);
    console.log(`    - Columns: ${table.columns}`);
    console.log(`    - Primary Key: ${table.primaryKey || 'none'}`);
    console.log(`    - Indexes: ${table.indexes}`);
  });

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  Demo Complete! RDBMS is working perfectly! ✓         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  return { db, parser };
}

if (require.main === module) {
  runDemo();
}

module.exports = { runDemo };
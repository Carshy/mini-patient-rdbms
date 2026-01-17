// ============================================================================
// SEED DATA SCRIPT - Populate database with sample data
// ============================================================================
// Run this after starting the server to add sample data
// Usage: node seed-data.js
// ============================================================================

const API_BASE = 'http://localhost:3001/api';

async function seedData() {
  console.log('🌱 Seeding database with sample data...\n');

  try {
    // Create patients
    console.log('👥 Creating patients...');
    await createPatient({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-0101',
      date_of_birth: '1985-03-15'
    });

    await createPatient({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '555-0102',
      date_of_birth: '1990-07-22'
    });

    await createPatient({
      name: 'Bob Johnson',
      email: 'bob.j@example.com',
      phone: '555-0103',
      date_of_birth: '1978-11-30'
    });
    console.log('✓ Created 3 patients\n');

    // Create doctors
    console.log('👨‍⚕️ Creating doctors...');
    await createDoctor({
      name: 'Dr. Sarah Williams',
      specialty: 'Cardiology',
      email: 'sarah.williams@hospital.com',
      phone: '555-1001',
      years_experience: 15
    });

    await createDoctor({
      name: 'Dr. Michael Chen',
      specialty: 'Pediatrics',
      email: 'michael.chen@hospital.com',
      phone: '555-1002',
      years_experience: 8
    });

    await createDoctor({
      name: 'Dr. Emily Brown',
      specialty: 'General Practice',
      email: 'emily.brown@hospital.com',
      phone: '555-1003',
      years_experience: 12
    });
    console.log('✓ Created 3 doctors\n');

    // Create appointments
    console.log('📅 Creating appointments...');
    await createAppointment({
      patient_id: 1,
      doctor_id: 1,
      appointment_date: '2025-01-25',
      reason: 'Annual checkup',
      status: 'scheduled'
    });

    await createAppointment({
      patient_id: 2,
      doctor_id: 2,
      appointment_date: '2025-01-26',
      reason: 'Flu symptoms',
      status: 'scheduled'
    });

    await createAppointment({
      patient_id: 3,
      doctor_id: 1,
      appointment_date: '2025-01-27',
      reason: 'Heart palpitations',
      status: 'confirmed'
    });

    await createAppointment({
      patient_id: 1,
      doctor_id: 3,
      appointment_date: '2025-01-28',
      reason: 'General consultation',
      status: 'scheduled'
    });
    console.log('✓ Created 4 appointments\n');

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('   • 3 Patients');
    console.log('   • 3 Doctors');
    console.log('   • 4 Appointments');
    console.log('\n🌐 View at: http://localhost:3001/api/patients');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('\n💡 Make sure the server is running: npm start');
  }
}

// Helper functions using native fetch (Node 18+) or http module
async function createPatient(data) {
  return makeRequest('POST', `${API_BASE}/patients`, data);
}

async function createDoctor(data) {
  return makeRequest('POST', `${API_BASE}/doctors`, data);
}

async function createAppointment(data) {
  return makeRequest('POST', `${API_BASE}/appointments`, data);
}

async function makeRequest(method, url, data) {
  const https = require('http');
  const urlParsed = new URL(url);

  const options = {
    hostname: urlParsed.hostname,
    port: urlParsed.port,
    path: urlParsed.pathname,
    method: method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run the seed function
seedData();
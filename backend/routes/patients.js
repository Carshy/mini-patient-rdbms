// ============================================================================
// PATIENTS ROUTES - API endpoints for patient management
// ============================================================================
// Handles all CRUD operations for patients
// ============================================================================

const express = require('express');
const router = express.Router();
const { getParser } = require('../config/database');
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  createdResponse,
  validationErrorResponse
} = require('../utils/response');

// ============================================================================
// GET /api/patients - Get all patients
// ============================================================================
router.get('/', async (req, res, next) => {
  try {
    const parser = getParser();
    const result = parser.execute('SELECT * FROM patients');
    
    successResponse(res, result.results, `Retrieved ${result.count} patient(s)`);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/patients/:id - Get single patient by ID
// ============================================================================
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
    
    const result = parser.execute(`SELECT * FROM patients WHERE id = ${id}`);
    
    if (result.count === 0) {
      return notFoundResponse(res, 'Patient');
    }
    
    successResponse(res, result.results[0], 'Patient retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/patients - Create new patient
// ============================================================================
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, date_of_birth } = req.body;
    
    // Validation
    if (!name || !email) {
      return validationErrorResponse(res, 'Name and email are required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return validationErrorResponse(res, 'Invalid email format');
    }

    const parser = getParser();
    const created_at = new Date().toISOString();
    
    // Build SQL query (must be single line for parser)
    const sql = `INSERT INTO patients (name, email, phone, date_of_birth, created_at) VALUES ('${name}', '${email}', ${phone ? `'${phone}'` : 'NULL'}, ${date_of_birth ? `'${date_of_birth}'` : 'NULL'}, '${created_at}')`;
    
    const result = parser.execute(sql);
    
    createdResponse(res, result.row, 'Patient created successfully');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PUT /api/patients/:id - Update patient
// ============================================================================
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, date_of_birth } = req.body;
    const parser = getParser();
    
    // Check if patient exists
    const checkResult = parser.execute(`SELECT * FROM patients WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Patient');
    }

    // Build update fields
    const updates = [];
    if (name !== undefined) updates.push(`name = '${name}'`);
    if (email !== undefined) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return validationErrorResponse(res, 'Invalid email format');
      }
      updates.push(`email = '${email}'`);
    }
    if (phone !== undefined) updates.push(`phone = ${phone ? `'${phone}'` : 'NULL'}`);
    if (date_of_birth !== undefined) updates.push(`date_of_birth = ${date_of_birth ? `'${date_of_birth}'` : 'NULL'}`);

    if (updates.length === 0) {
      return validationErrorResponse(res, 'No fields to update');
    }

    const sql = `UPDATE patients SET ${updates.join(', ')} WHERE id = ${id}`;
    parser.execute(sql);
    
    // Get updated patient
    const updatedResult = parser.execute(`SELECT * FROM patients WHERE id = ${id}`);
    
    successResponse(res, updatedResult.results[0], 'Patient updated successfully');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DELETE /api/patients/:id - Delete patient
// ============================================================================
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
    
    // Check if patient exists
    const checkResult = parser.execute(`SELECT * FROM patients WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Patient');
    }

    // Check if patient has appointments
    const appointmentsResult = parser.execute(`SELECT * FROM appointments WHERE patient_id = ${id}`);
    if (appointmentsResult.count > 0) {
      return errorResponse(
        res,
        'Cannot delete patient with existing appointments. Delete appointments first.',
        400
      );
    }

    parser.execute(`DELETE FROM patients WHERE id = ${id}`);
    
    successResponse(res, null, 'Patient deleted successfully');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/patients/:id/appointments - Get patient's appointments
// ============================================================================
router.get('/:id/appointments', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
    
    // Check if patient exists
    const checkResult = parser.execute(`SELECT * FROM patients WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Patient');
    }

    // Get appointments with doctor details
    const result = parser.execute(`SELECT * FROM appointments INNER JOIN doctors ON appointments.doctor_id = doctors.id WHERE appointments.patient_id = ${id}`);
    
    successResponse(res, result.results, `Retrieved ${result.count} appointment(s)`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
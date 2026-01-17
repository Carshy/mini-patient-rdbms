// ============================================================================
// DOCTORS ROUTES - API endpoints for doctor management
// ============================================================================
// Handles all CRUD operations for doctors
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
// GET /api/doctors - Get all doctors
// ============================================================================
router.get('/', async (req, res, next) => {
  try {
    const parser = getParser();
    const { specialty } = req.query;
    
    let sql = 'SELECT * FROM doctors';
    if (specialty) {
      sql += ` WHERE specialty LIKE '${specialty}'`;
    }
    
    const result = parser.execute(sql);
    
    successResponse(res, result.results, `Retrieved ${result.count} doctor(s)`);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/doctors/:id - Get single doctor by ID
// ============================================================================
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
    
    const result = parser.execute(`SELECT * FROM doctors WHERE id = ${id}`);
    
    if (result.count === 0) {
      return notFoundResponse(res, 'Doctor');
    }
    
    successResponse(res, result.results[0], 'Doctor retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/doctors - Create new doctor
// ============================================================================
router.post('/', async (req, res, next) => {
  try {
    const { name, specialty, email, phone, years_experience } = req.body;
    
    // Validation
    if (!name || !specialty || !email) {
      return validationErrorResponse(res, 'Name, specialty, and email are required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return validationErrorResponse(res, 'Invalid email format');
    }

    const parser = getParser();
    
    const sql = `INSERT INTO doctors (name, specialty, email, phone, years_experience) VALUES ('${name}', '${specialty}', '${email}', ${phone ? `'${phone}'` : 'NULL'}, ${years_experience || 0})`;
    
    const result = parser.execute(sql);
    
    createdResponse(res, result.row, 'Doctor created successfully');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PUT /api/doctors/:id - Update doctor
// ============================================================================
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, specialty, email, phone, years_experience } = req.body;
    const parser = getParser();
    
    // Check if doctor exists
    const checkResult = parser.execute(`SELECT * FROM doctors WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Doctor');
    }

    // Build update fields
    const updates = [];
    if (name !== undefined) updates.push(`name = '${name}'`);
    if (specialty !== undefined) updates.push(`specialty = '${specialty}'`);
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return validationErrorResponse(res, 'Invalid email format');
      }
      updates.push(`email = '${email}'`);
    }
    if (phone !== undefined) updates.push(`phone = ${phone ? `'${phone}'` : 'NULL'}`);
    if (years_experience !== undefined) updates.push(`years_experience = ${years_experience}`);

    if (updates.length === 0) {
      return validationErrorResponse(res, 'No fields to update');
    }

    const sql = `UPDATE doctors SET ${updates.join(', ')} WHERE id = ${id}`;
    parser.execute(sql);
    
    // Get updated doctor
    const updatedResult = parser.execute(`SELECT * FROM doctors WHERE id = ${id}`);
    
    successResponse(res, updatedResult.results[0], 'Doctor updated successfully');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DELETE /api/doctors/:id - Delete doctor
// ============================================================================
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
    
    // Check if doctor exists
    const checkResult = parser.execute(`SELECT * FROM doctors WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Doctor');
    }

    // Check if doctor has appointments
    const appointmentsResult = parser.execute(`SELECT * FROM appointments WHERE doctor_id = ${id}`);
    if (appointmentsResult.count > 0) {
      return errorResponse(
        res,
        'Cannot delete doctor with existing appointments. Delete appointments first.',
        400
      );
    }

    parser.execute(`DELETE FROM doctors WHERE id = ${id}`);
    
    successResponse(res, null, 'Doctor deleted successfully');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/doctors/:id/appointments - Get doctor's appointments
// ============================================================================
router.get('/:id/appointments', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
    
    // Check if doctor exists
    const checkResult = parser.execute(`SELECT * FROM doctors WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Doctor');
    }

    // Get appointments with patient details
    const result = parser.execute(`SELECT * FROM appointments INNER JOIN patients ON appointments.patient_id = patients.id WHERE appointments.doctor_id = ${id}`);
    
    successResponse(res, result.results, `Retrieved ${result.count} appointment(s)`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
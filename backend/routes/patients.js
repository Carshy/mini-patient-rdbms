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

router.get('/', async (req, res, next) => {
  try {
    const parser = getParser();
    const result = parser.execute('SELECT * FROM patients');
    
    successResponse(res, result.results, `Retrieved ${result.count} patient(s)`);
  } catch (error) {
    next(error);
  }
});

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

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, date_of_birth } = req.body;
    
    if (!name || !email) {
      return validationErrorResponse(res, 'Name and email are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return validationErrorResponse(res, 'Invalid email format');
    }

    const parser = getParser();
    const created_at = new Date().toISOString();
    
    const sql = `INSERT INTO patients (name, email, phone, date_of_birth, created_at) VALUES ('${name}', '${email}', ${phone ? `'${phone}'` : 'NULL'}, ${date_of_birth ? `'${date_of_birth}'` : 'NULL'}, '${created_at}')`;
    
    const result = parser.execute(sql);
    
    createdResponse(res, result.row, 'Patient created successfully');
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, date_of_birth } = req.body;
    const parser = getParser();
    
    const checkResult = parser.execute(`SELECT * FROM patients WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Patient');
    }

    const updates = [];
    if (name !== undefined) updates.push(`name = '${name}'`);
    if (email !== undefined) {
      
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
    
    const updatedResult = parser.execute(`SELECT * FROM patients WHERE id = ${id}`);
    
    successResponse(res, updatedResult.results[0], 'Patient updated successfully');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
    
    const checkResult = parser.execute(`SELECT * FROM patients WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Patient');
    }

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

router.get('/:id/appointments', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
    
    const checkResult = parser.execute(`SELECT * FROM patients WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Patient');
    }

    const result = parser.execute(`SELECT * FROM appointments INNER JOIN doctors ON appointments.doctor_id = doctors.id WHERE appointments.patient_id = ${id}`);
    
    successResponse(res, result.results, `Retrieved ${result.count} appointment(s)`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
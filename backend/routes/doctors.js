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

router.post('/', async (req, res, next) => {
  try {
    const { name, specialty, email, phone, years_experience } = req.body;
    
    if (!name || !specialty || !email) {
      return validationErrorResponse(res, 'Name, specialty, and email are required');
    }

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

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, specialty, email, phone, years_experience } = req.body;
    const parser = getParser();
    
    const checkResult = parser.execute(`SELECT * FROM doctors WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Doctor');
    }

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
    
    const updatedResult = parser.execute(`SELECT * FROM doctors WHERE id = ${id}`);
    
    successResponse(res, updatedResult.results[0], 'Doctor updated successfully');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
    
    const checkResult = parser.execute(`SELECT * FROM doctors WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Doctor');
    }

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

router.get('/:id/appointments', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
   
    const checkResult = parser.execute(`SELECT * FROM doctors WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Doctor');
    }

    const result = parser.execute(`SELECT * FROM appointments INNER JOIN patients ON appointments.patient_id = patients.id WHERE appointments.doctor_id = ${id}`);
    
    successResponse(res, result.results, `Retrieved ${result.count} appointment(s)`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
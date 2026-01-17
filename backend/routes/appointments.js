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
    const { status, date } = req.query;
    
    let sql = 'SELECT * FROM appointments';
    const conditions = [];
    
    if (status) conditions.push(`status = '${status}'`);
    if (date) conditions.push(`appointment_date = '${date}'`);
    
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    const result = parser.execute(sql);
    
    successResponse(res, result.results, `Retrieved ${result.count} appointment(s)`);
  } catch (error) {
    next(error);
  }
});

router.get('/with-details', async (req, res, next) => {
  try {
    const parser = getParser();
    
    const withPatients = parser.execute(`SELECT * FROM appointments INNER JOIN patients ON appointments.patient_id = patients.id`);
    
    const withDoctors = parser.execute(`SELECT * FROM appointments INNER JOIN doctors ON appointments.doctor_id = doctors.id`);
    
    const results = withPatients.results.map(apt => {
      const doctorData = withDoctors.results.find(
        d => d['appointments.id'] === apt['appointments.id']
      );
      return { ...apt, ...doctorData };
    });
    
    successResponse(res, results, `Retrieved ${results.length} appointment(s) with details`);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
    
    const result = parser.execute(`SELECT * FROM appointments WHERE id = ${id}`);
    
    if (result.count === 0) {
      return notFoundResponse(res, 'Appointment');
    }
    
    successResponse(res, result.results[0], 'Appointment retrieved successfully');
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      patient_id,
      doctor_id,
      appointment_date,
      reason,
      status
    } = req.body;
    
    if (!patient_id || !doctor_id || !appointment_date || !status) {
      return validationErrorResponse(
        res,
        'patient_id, doctor_id, appointment_date, and status are required'
      );
    }

    const parser = getParser();

    const patientCheck = parser.execute(`SELECT * FROM patients WHERE id = ${patient_id}`);
    if (patientCheck.count === 0) {
      return errorResponse(res, 'Patient not found', 404);
    }

    const doctorCheck = parser.execute(`SELECT * FROM doctors WHERE id = ${doctor_id}`);
    if (doctorCheck.count === 0) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return validationErrorResponse(
        res,
        `Status must be one of: ${validStatuses.join(', ')}`
      );
    }
    
    const sql = `INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status) VALUES (${patient_id}, ${doctor_id}, '${appointment_date}', ${reason ? `'${reason}'` : 'NULL'}, '${status}')`;
    
    const result = parser.execute(sql);
    
    createdResponse(res, result.row, 'Appointment created successfully');
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      patient_id,
      doctor_id,
      appointment_date,
      reason,
      status
    } = req.body;
    const parser = getParser();
    
    const checkResult = parser.execute(`SELECT * FROM appointments WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Appointment');
    }

    const updates = [];
    
    if (patient_id !== undefined) {
      const patientCheck = parser.execute(`SELECT * FROM patients WHERE id = ${patient_id}`);
      if (patientCheck.count === 0) {
        return errorResponse(res, 'Patient not found', 404);
      }
      updates.push(`patient_id = ${patient_id}`);
    }
    
    if (doctor_id !== undefined) {
      const doctorCheck = parser.execute(`SELECT * FROM doctors WHERE id = ${doctor_id}`);
      if (doctorCheck.count === 0) {
        return errorResponse(res, 'Doctor not found', 404);
      }
      updates.push(`doctor_id = ${doctor_id}`);
    }
    
    if (appointment_date !== undefined) updates.push(`appointment_date = '${appointment_date}'`);
    if (reason !== undefined) updates.push(`reason = ${reason ? `'${reason}'` : 'NULL'}`);
    if (status !== undefined) {
      const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return validationErrorResponse(
          res,
          `Status must be one of: ${validStatuses.join(', ')}`
        );
      }
      updates.push(`status = '${status}'`);
    }

    if (updates.length === 0) {
      return validationErrorResponse(res, 'No fields to update');
    }

    const sql = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ${id}`;
    parser.execute(sql);
    
    const updatedResult = parser.execute(`SELECT * FROM appointments WHERE id = ${id}`);
    
    successResponse(res, updatedResult.results[0], 'Appointment updated successfully');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parser = getParser();
   
    const checkResult = parser.execute(`SELECT * FROM appointments WHERE id = ${id}`);
    if (checkResult.count === 0) {
      return notFoundResponse(res, 'Appointment');
    }

    parser.execute(`DELETE FROM appointments WHERE id = ${id}`);
    
    successResponse(res, null, 'Appointment deleted successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
import express from 'express';
import { createStudent, deleteStudent, exportStudentsCSV, getAllStudents, getStudentById, getStudentData, updateStudent } from '../controllers/studentController.js';


const router = express.Router();

// GET /api/students - Get all students
router.get('/', getAllStudents);

// GET /api/students/export/csv - Export active students data to CSV
router.get('/export/csv', exportStudentsCSV);

// GET /api/students/:id - Get student by ID
router.get('/:id', getStudentById);

// POST /api/students - Create new student
router.post('/', createStudent);

// PUT /api/students/:id - Update student
router.put('/:id', updateStudent);

// DELETE /api/students/:id - Delete student
router.delete('/:id', deleteStudent);

// GET /api/students/:id/data - Get student analytics data
router.get('/:id/data', getStudentData);

export default router;
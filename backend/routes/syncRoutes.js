import express from 'express';
import {
    syncStudent,
    syncAllStudents,
    getSyncStatus
} from '../controllers/syncController.js';

const router = express.Router();

// POST /api/sync/cf/:handle - Sync Codeforces data for student
router.post('/cf/:handle', syncStudent);

// POST /api/sync/all - Sync all students
router.post('/all', syncAllStudents);

// GET /api/sync/status/:id - Get sync status for student
router.get('/status/:id', getSyncStatus);

export default router;
import express from 'express';
import {
    getCronSchedule,
    updateCronSchedule
} from '../controllers/cronController.js';

const router = express.Router();

// GET /api/cron/schedule - Get current cron schedule
router.get('/schedule', getCronSchedule);

// POST /api/cron/update - Update cron schedule
router.post('/update', updateCronSchedule);

export default router;
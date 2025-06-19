import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

// Import routes
import studentRoutes from './routes/studentRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import cronRoutes from './routes/cronRoutes.js';

// Import services
import { syncAllStudentsData } from './services/codeforcesService.js';
import { checkInactiveStudents } from './services/emailService.js';
import ProblemStats from './models/ProblemStats.js';
import Student from './models/Student.js';
import ContestHistory from './models/ContestHistory.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(limiter);
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/cron', cronRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {


    const result = await ProblemStats.deleteMany();
    console.log(`Deleted ${result.deletedCount} problem stats records`);
    const result2 = await ContestHistory.deleteMany();
    console.log(`Deleted ${result2.deletedCount} contest states records`);
    const result3 = await Student.deleteMany();
    console.log(`Deleted ${result3.deletedCount} student records`);


    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});


// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-progress')
    .then(() => {
        console.log('✅ Connected to MongoDB');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
        });

        // Start cron jobs
        setupCronJobs();
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Cron job setup
function setupCronJobs() {
    // Daily sync at 2 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('🔄 Starting daily Codeforces data sync...');
        try {
            await syncAllStudentsData();
            await checkInactiveStudents();
            console.log('✅ Daily sync completed successfully');
        } catch (error) {
            console.error('❌ Daily sync failed:', error);
        }
    }, {
        timezone: 'UTC'
    });

    console.log('⏰ Cron jobs scheduled');
}

// Graceful shutdown
// Without this, our app might shut down suddenly and leave database connections hanging.
// This makes sure everything is closed cleanly and safely
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('Database connection closed.');
        process.exit(0);
    });
});

export default app;
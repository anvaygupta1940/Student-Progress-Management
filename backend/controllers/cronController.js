import cron from 'node-cron';


// Stores the current running cron job instance.
let currentCronJob = null;
let currentSchedule = '0 2 * * *'; // Default: 2 AM daily

// Get current cron schedule -> return the current cron schedule and whether the job is running or not.
export const getCronSchedule = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                schedule: currentSchedule,
                isRunning: currentCronJob ? true : false,
                description: getCronDescription(currentSchedule)
            }
        });
    } catch (error) {
        console.error('Error getting cron schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cron schedule',
            error: error.message
        });
    }
};

// Update cron schedule
export const updateCronSchedule = async (req, res) => {
    try {
        const { schedule } = req.body;

        if (!schedule) {
            return res.status(400).json({
                success: false,
                message: 'Schedule is required'
            });
        }

        // Validate cron expression
        if (!cron.validate(schedule)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cron expression'
            });
        }

        // Stop current job if running
        if (currentCronJob) {
            currentCronJob.stop();
            currentCronJob.destroy();
        }

        // Start new job
        currentCronJob = cron.schedule(schedule, async () => {
            console.log('🔄 Running scheduled sync...');
            try {
                const { syncAllStudentsData } = await import('../services/codeforcesService.js');
                const { checkInactiveStudents } = await import('../services/emailService.js');

                await syncAllStudentsData();
                await checkInactiveStudents();
                console.log('✅ Scheduled sync completed');
            } catch (error) {
                console.error('❌ Scheduled sync failed:', error);
            }
        });

        currentSchedule = schedule;

        res.json({
            success: true,
            message: 'Cron schedule updated successfully',
            data: {
                schedule: currentSchedule,
                description: getCronDescription(currentSchedule)
            }
        });
    } catch (error) {
        console.error('Error updating cron schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cron schedule',
            error: error.message
        });
    }
};

// Helper function to describe cron expression
function getCronDescription(cronExpression) {
    const patterns = {
        '0 2 * * *': 'Daily at 2:00 AM',
        '0 */6 * * *': 'Every 6 hours',
        '0 0 */2 * *': 'Every 2 days at midnight',
        '0 1 * * 0': 'Weekly on Sunday at 1:00 AM',
        '*/30 * * * *': 'Every 30 minutes'
    };

    return patterns[cronExpression] || 'Custom schedule';
}
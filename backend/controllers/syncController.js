import { syncStudentData, syncAllStudentsData } from '../services/codeforcesService.js';
import Student from '../models/Student.js';

// Sync individual student
export const syncStudent = async (req, res) => {
    try {
        const { handle } = req.params;

        const student = await Student.findOne({
            codeforcesHandle: handle,
            isActive: true
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const result = await syncStudentData(student._id, handle);

        res.json({
            success: true,
            message: 'Student data synced successfully',
            data: result
        });
    } catch (error) {
        console.error('Error syncing student:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync student data',
            error: error.message
        });
    }
};

// Sync all students
export const syncAllStudents = async (req, res) => {
    try {
        const result = await syncAllStudentsData();

        res.json({
            success: true,
            message: 'All students synced successfully',
            data: result
        });
    } catch (error) {
        console.error('Error syncing all students:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync all students',
            error: error.message
        });
    }
};

// Get sync status
export const getSyncStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);

        if (!student || !student.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            data: {
                studentId: student._id,
                handle: student.codeforcesHandle,
                lastSynced: student.lastSynced,
                daysSinceLastSync: student.daysSinceLastSync,
                isInactive: student.isInactive
            }
        });
    } catch (error) {
        console.error('Error getting sync status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get sync status',
            error: error.message
        });
    }
};
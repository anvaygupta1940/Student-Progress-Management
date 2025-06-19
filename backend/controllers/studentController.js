import Student from "../models/Student.js";
import { syncStudentData } from '../services/codeforcesService.js';
import ContestHistory from '../models/ContestHistory.js';
import ProblemStats from '../models/ProblemStats.js';

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    // Fetch all active students, excluding the __v field (document version key), sorted by creation date in descending order
    //  to get the newly added students first
    const students = await Student.find({ isActive: true })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};



// Export active students data to CSV format
export const exportStudentsCSV = async (req, res) => {
  try {

    // find the active students, select the required fields any sort them by name
    const students = await Student.find({ isActive: true })
      .select('name email phone codeforcesHandle currentRating maxRating lastSynced')
      .sort({ name: 1 });

    // Convert to CSV format
    const csvHeader = 'Name,Email,Phone,Codeforces Handle,Current Rating,Max Rating,Last Synced\n';
    const csvData = students.map(student => {

      // is the student has lastSynced date, if not then set it to 'Never'
      // if yes, then convert the javascript date object to a readable date  format like YYYY-MM-DD
      const lastSynced = student.lastSynced
        ? student.lastSynced.toISOString().split('T')[0]
        : 'Never';

      return `"${student.name}","${student.email}","${student.phone}","${student.codeforcesHandle}",${student.currentRating},${student.maxRating},"${lastSynced}"`;
    }).join('\n');

    const csv = csvHeader + csvData;

    // tells the browser that it is a CSV file and should be downloaded with the name "students.csv"
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CSV',
      error: error.message
    });
  }
};


// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message
    });
  }
};


// Create new student
export const createStudent = async (req, res) => {
  try {
    const { name, email, phone, codeforcesHandle } = req.body;

    // Checking if student with email or handle already exists
    const existingStudent = await Student.findOne({
      $or: [
        { email: email.toLowerCase() },
        { codeforcesHandle: codeforcesHandle.trim() }
      ],
      isActive: true
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or Codeforces handle already exists'
      });
    }

    const student = new Student({
      name: name.trim(),
      email: email.toLowerCase(),
      phone: phone.trim(),
      codeforcesHandle: codeforcesHandle.trim()
    });

    await student.save();

    // console.log('New student created>>>', student);

    // Sync Codeforces data in the background
    syncStudentData(student._id, codeforcesHandle.trim())
      .catch(error => console.error('Background sync failed:', error));

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    console.error('Error creating student:', error);

    // validation error occur when the data we are try to save in the DB does not match the schema
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message
    });
  }
};


// Update student
export const updateStudent = async (req, res) => {
  try {
    const { name, email, phone, codeforcesHandle, autoEmailEnabled } = req.body;
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // if we are changing the email or codeforces handle, we need to check if there is any other student with the same email or handle
    if (email !== student.email || codeforcesHandle !== student.codeforcesHandle) {
      const existingStudent = await Student.findOne({
        _id: { $ne: studentId },
        $or: [
          { email: email.toLowerCase() },
          { codeforcesHandle: codeforcesHandle.trim() }
        ],
        isActive: true
      });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student with this email or Codeforces handle already exists'
        });
      }
    }

    const oldHandle = student.codeforcesHandle;

    // Update student fields
    student.name = name.trim();
    student.email = email.toLowerCase();
    student.phone = phone.trim();
    student.codeforcesHandle = codeforcesHandle.trim();

    if (autoEmailEnabled !== undefined) {
      student.autoEmailEnabled = autoEmailEnabled;
    }

    await student.save();

    // if we are changing the codeforces handle, we need to sync the data in the background
    if (oldHandle !== codeforcesHandle.trim()) {
      syncStudentData(studentId, codeforcesHandle.trim())
        .catch(error => console.error('Background sync failed:', error));
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Error updating student:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message
    });
  }
};


// Delete student -> changing the student Active status to false
// This is a soft delete, the student data will still be in the database but will not be considered active
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.isActive = false;
    await student.save();

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    });
  }
};



// Get student analytics data
export const getStudentData = async (req, res) => {
  try {

    // /students/123/data?contestDays=60&problemDays=15
    const studentId = req.params.id;
    const { contestDays = 30, problemDays = 30 } = req.query;


    const student = await Student.findById(studentId);
    if (!student || !student.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // setting start date for contest filtering

    const contestStartDate = new Date();
    contestStartDate.setDate(contestStartDate.getDate() - parseInt(contestDays));

    // setting start date for problem filtering
    const problemStartDate = new Date();
    problemStartDate.setDate(problemStartDate.getDate() - parseInt(problemDays));


    // Fetching all the contests in which the student has participated in the last contestDays days
    const contestHistory = await ContestHistory.find({
      studentId,
      date: { $gte: contestStartDate }
    }).sort({ date: -1 });


    // Fetching all the problems solved by the student in the last problemDays days
    const problemStats = await ProblemStats.find({
      studentId,
      date: { $gte: problemStartDate },
      solved: true
    }).sort({ date: -1 });


    // Calculate analytics
    const analytics = {

      contestStats: {
        totalContests: contestHistory.length,   // total number of contests student participated in
        averageRank: contestHistory.length > 0
          ? Math.round(contestHistory.reduce((sum, c) => sum + c.rank, 0) / contestHistory.length)
          : 0,
        ratingGain: contestHistory.length > 0
          ? contestHistory.reduce((sum, c) => sum + c.ratingChange, 0)
          : 0
      },

      problemStats: {
        totalSolved: problemStats.length, // total number of problems solved by the student
        averageRating: problemStats.length > 0
          ? Math.round(problemStats.reduce((sum, p) => sum + p.rating, 0) / problemStats.length)
          : 0,
        maxRating: problemStats.length > 0
          ? Math.max(...problemStats.map(p => p.rating))
          : 0,
        averagePerDay: problemStats.length > 0
          ? (problemStats.length / parseInt(problemDays)).toFixed(2)
          : 0
      }
    };

    // Rating buckets for chart
    const ratingBuckets = {
      '800-1000': 0,
      '1001-1200': 0,
      '1201-1400': 0,
      '1401-1600': 0,
      '1601-1800': 0,
      '1801-2000': 0,
      '2000+': 0
    };

    problemStats.forEach(problem => {
      const rating = problem.rating;
      if (rating <= 1000) ratingBuckets['800-1000']++;
      else if (rating <= 1200) ratingBuckets['1001-1200']++;
      else if (rating <= 1400) ratingBuckets['1201-1400']++;
      else if (rating <= 1600) ratingBuckets['1401-1600']++;
      else if (rating <= 1800) ratingBuckets['1601-1800']++;
      else if (rating <= 2000) ratingBuckets['1801-2000']++;
      else ratingBuckets['2000+']++;
    });

    res.json({
      success: true,
      data: {
        student,
        contestHistory,
        problemStats,
        analytics,
        ratingBuckets
      }
    });
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student data',
      error: error.message
    });
  }
};

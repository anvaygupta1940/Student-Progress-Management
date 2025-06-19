import mongoose from 'mongoose';

const problemStatsSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: [800, 'Problem rating must be at least 800'],
        max: [3500, 'Problem rating cannot exceed 3500']
    },
    solved: {
        type: Boolean,
        required: true
    },
    problemName: {
        type: String,
        required: true,
        trim: true
    },
    problemId: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    contestId: {
        type: String,
        default: null
    },
    index: {
        type: String,
        default: null
    },
    submissionId: {
        type: String,
        required: true,
        unique: true
    },
    language: {
        type: String,
        default: null
    },
    verdict: {
        type: String,
        enum: ['OK', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'COMPILATION_ERROR', 'RUNTIME_ERROR', 'MEMORY_LIMIT_EXCEEDED', 'PRESENTATION_ERROR', 'IDLENESS_LIMIT_EXCEEDED', 'SECURITY_VIOLATED', 'CRASHED', 'INPUT_PREPARATION_CRASHED', 'CHALLENGED', 'SKIPPED', 'TESTING', 'REJECTED'],
        default: 'OK'
    }
}, {
    timestamps: true
});


//indexing for finding problem of a student from latest to oldest
problemStatsSchema.index({ studentId: 1, date: -1 });
// indexing to find the hardest problems solved by a student
problemStatsSchema.index({ studentId: 1, rating: -1 });
// indxeing to find all problems solved by a student from latest to oldest
problemStatsSchema.index({ studentId: 1, solved: 1, date: -1 });

export default mongoose.model('ProblemStats', problemStatsSchema);
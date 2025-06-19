import mongoose from 'mongoose';

const contestHistorySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    contestId: {
        type: String,
        required: true
    },
    contestName: {
        type: String,
        required: true,
        trim: true
    },
    rank: {
        type: Number,
        required: true,
        min: [1, 'Rank must be at least 1']
    },
    ratingChange: {
        type: Number,
        required: true
    },
    newRating: {
        type: Number,
        required: true,
        min: [0, 'Rating cannot be negative']
    },
    problemsUnsolved: {
        type: Number,
        default: 0,
        min: [0, 'Problems unsolved cannot be negative']
    },
    date: {
        type: Date,
        required: true
    },
    contestType: {
        type: String,
        enum: ['CF', 'IOI', 'ICPC'],
        default: 'CF'
    }
}, {
    timestamps: true
});


// to find all contests for a student from latest to oldest 
contestHistorySchema.index({ studentId: 1, date: -1 });
// to ensure one student can have only one entry for a contest
contestHistorySchema.index({ studentId: 1, contestId: 1 }, { unique: true });

export default mongoose.model('ContestHistory', contestHistorySchema);
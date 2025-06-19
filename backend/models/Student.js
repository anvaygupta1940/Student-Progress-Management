import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number']
    },
    codeforcesHandle: {
        type: String,
        required: [true, 'Codeforces handle is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Handle cannot exceed 50 characters']
    },
    currentRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative']
    },
    maxRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative']
    },
    lastSynced: {
        type: Date,
        default: null
    },
    autoEmailEnabled: {
        type: Boolean,
        default: true
    },
    reminderCount: {
        type: Number,
        default: 0,
        min: [0, 'Reminder count cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastSubmissionDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }, //Makes sure virtual fields are included when we convert document to JSON like in api-response. Without it -> virtuals are hidden
    toObject: { virtuals: true } // Makes sure virtual fields are included when we convert document to Javascript Object.
});


// virtuals are the fileds that are not stored in the database but are created when we fetch the data
// Virtual field for :-   days since last sync i.e how many days have passed since the last sync
studentSchema.virtual('daysSinceLastSync').get(function () {
    if (!this.lastSynced) return null;
    const diffTime = Date.now() - this.lastSynced.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});


// Virtual field for :- inactive status i.e, whether the student is inactive based on last submission date
// to determine inactivity, we consider a student inactive if he haven't submitted anything in the last 7 days
// helps in determining whether email reminders should be sent or not
studentSchema.virtual('isInactive').get(function () {
    if (!this.lastSubmissionDate) return true;
    const diffTime = Date.now() - this.lastSubmissionDate.getTime();
    const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return daysSince > 7;
});

// Index for efficient queries
studentSchema.index({ lastSynced: 1 });
studentSchema.index({ lastSubmissionDate: 1 });

export default mongoose.model('Student', studentSchema);
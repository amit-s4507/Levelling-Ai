import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    questionsAnswered: {
        type: Number,
        required: true,
        min: 0
    },
    correctAnswers: {
        type: Number,
        required: true,
        min: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    chapterIndex: {
        type: Number,
        required: true,
        min: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const bookmarkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    timeInVideo: {
        type: Number,
        required: true,
        min: 0
    },
    note: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    watchTime: {
        type: Number,
        default: 0,
        min: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    lastWatched: {
        type: Date,
        default: Date.now
    },
    quizAttempts: [quizAttemptSchema],
    notes: [noteSchema],
    bookmarks: [bookmarkSchema]
}, {
    timestamps: true
});

// Virtual for completion percentage
progressSchema.virtual('completionPercentage').get(async function() {
    const video = await mongoose.model('Video').findById(this.video);
    if (!video) return 0;
    return Math.min(100, Math.round((this.watchTime / video.duration) * 100));
});

// Virtual for average quiz score
progressSchema.virtual('averageQuizScore').get(function() {
    if (!this.quizAttempts.length) return 0;
    const totalScore = this.quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    return Math.round(totalScore / this.quizAttempts.length);
});

// Method to update watch time
progressSchema.methods.updateWatchTime = async function(newWatchTime) {
    this.watchTime = newWatchTime;
    this.lastWatched = new Date();
    
    // Check if video is completed (90% watched)
    const video = await mongoose.model('Video').findById(this.video);
    if (video && (newWatchTime / video.duration) >= 0.9) {
        this.completed = true;
    }
    
    return this.save();
};

// Method to add quiz attempt
progressSchema.methods.addQuizAttempt = function(score, questionsAnswered, correctAnswers) {
    this.quizAttempts.push({
        score,
        questionsAnswered,
        correctAnswers
    });
    return this.save();
};

// Method to add note
progressSchema.methods.addNote = function(content, chapterIndex) {
    this.notes.push({
        content,
        chapterIndex
    });
    return this.save();
};

// Method to add bookmark
progressSchema.methods.addBookmark = function(title, timeInVideo, note = '') {
    this.bookmarks.push({
        title,
        timeInVideo,
        note
    });
    return this.save();
};

// Compound index for user and video
progressSchema.index({ user: 1, video: 1 }, { unique: true });

export const Progress = mongoose.model('Progress', progressSchema); 
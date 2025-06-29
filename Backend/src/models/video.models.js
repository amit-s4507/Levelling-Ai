import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const chapterSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  startTime: {
    type: Number,
    required: true
  },
  endTime: {
    type: Number,
    required: true
  },
  summary: {
    type: String,
    required: true
  }
});

const quizQuestionSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  topic: String,
  timestamp: Number // Optional: link question to video timestamp
});

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // Cloudinary URL
      required: true,
    },
    thumbnail: {
      type: String, // Cloudinary URL
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate"
    },
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
      lastViewed: {
        type: Date,
        default: Date.now
      }
    }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // AI-Generated Content
    transcript: {
      type: String,
      default: ""
    },
    summary: {
      type: String,
      default: ""
    },
    chapters: {
      type: [chapterSchema],
      default: []
    },
    quiz: {
      type: [quizQuestionSchema],
      default: []
    },
    keywords: {
      type: [String],
      default: []
    },
    learningObjectives: {
      type: [String],
      default: []
    },

    // Analytics Fields
    averageWatchTime: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    engagement: {
      likes: {
        type: Number,
        default: 0
      },
      comments: {
        type: Number,
        default: 0
      },
      shares: {
        type: Number,
        default: 0
      }
    },
    aiProcessingStatus: {
      transcript: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending"
      },
      summary: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending"
      },
      chapters: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending"
      },
      quiz: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending"
      }
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
videoSchema.index({ title: 'text', description: 'text', keywords: 'text' });
videoSchema.index({ category: 1, difficulty: 1 });
videoSchema.index({ owner: 1, createdAt: -1 });
videoSchema.index({ 'viewedBy.user': 1 });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
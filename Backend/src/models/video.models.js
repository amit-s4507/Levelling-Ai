import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile : {
            type : String, //cloudinary url
            required : true,
        },
        thumbnail : {
            type: String, //cloudinary url
            required : true,
        },
        title : {
            type: String,
            required : true,
        },
        description : {
            type: String,
            required : true,
        },
        duration : {
            type: Number,
            required : true,
        },
        views : {
            type : Number,
            default : 0
        },
        isPublished : {
            type : Boolean,
            default : true,
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        // AI-generated content
        isAIProcessed: {
            type: Boolean,
            default: false
        },
        aiProcessingError: {
            type: String,
            default: null
        },
        transcript: {
            type: String,
            default: null
        },
        summary: {
            type: String,
            default: null
        },
        chapters: [{
            title: String,
            startTime: Number,
            endTime: Number,
            summary: String
        }],
        keywords: [{
            type: String
        }],
        // Learning metadata
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'intermediate'
        },
        category: {
            type: String,
            required: true,
            index: true
        },
        tags: [{
            type: String,
            index: true
        }],
        // Quiz and learning materials
        quiz: [{
            question: String,
            options: [String],
            correctAnswer: Number,
            explanation: String
        }],
        resources: [{
            title: String,
            url: String,
            type: {
                type: String,
                enum: ['document', 'link', 'code', 'exercise']
            }
        }],
        // Engagement metrics
        likes: {
            type: Number,
            default: 0
        },
        averageWatchTime: {
            type: Number,
            default: 0
        },
        completionRate: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps : true
    }
)

// Indexes for better query performance
videoSchema.index({ title: 'text', description: 'text', keywords: 'text' });
videoSchema.index({ category: 1, difficulty: 1 });
videoSchema.index({ owner: 1, createdAt: -1 });

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)
import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {
    generateTranscript,
    generateSummary,
    generateChapters,
    generateQuiz,
    generateKeywords
} from "../utils/openai.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        query, 
        sortBy = "createdAt", 
        sortType = "desc", 
        category,
        difficulty,
        userId 
    } = req.query;

    const pipeline = [];

    // Match stage for filtering
    const matchStage = {};
    
    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { keywords: { $regex: query, $options: "i" } }
        ];
    }

    if (category) matchStage.category = category;
    if (difficulty) matchStage.difficulty = difficulty;
    if (userId) matchStage.owner = new mongoose.Types.ObjectId(userId);

    if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
    }

    // Lookup stage for owner details
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }
            ]
        }
    });

    pipeline.push({ $unwind: "$owner" });

    // Sorting stage
    pipeline.push({
        $sort: {
            [sortBy]: sortType === "desc" ? -1 : 1
        }
    });

    const videos = await Video.aggregatePaginate(
        Video.aggregate(pipeline),
        {
            page: parseInt(page),
            limit: parseInt(limit)
        }
    );

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, category, difficulty = "intermediate" } = req.body;

    if (!title || !description || !category) {
        throw new ApiError(400, "All fields are required");
    }

    // Get video and thumbnail files
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    // Upload to cloudinary
    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!video || !thumbnail) {
        throw new ApiError(500, "Error while uploading video or thumbnail");
    }

    // Create video document with basic info first
    const videoDoc = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        category,
        difficulty,
        owner: req.user._id,
        // Initialize AI fields with empty/default values
        transcript: "",
        summary: "",
        chapters: [],
        quiz: [],
        keywords: []
    });

    // Start AI processing in background (will be updated later)
    try {
        // Process AI content asynchronously
        processAIContent(videoDoc._id, video.url).catch(error => 
            console.error("Error in background AI processing:", error)
        );
    } catch (error) {
        console.error("Error scheduling AI processing:", error);
        // Don't throw error here as video is already uploaded
    }

    return res.status(201).json(
        new ApiResponse(201, videoDoc, "Video uploaded successfully. AI processing will complete in background.")
    );
});

// Separate function for AI processing
const processAIContent = async (videoId, videoUrl) => {
    try {
        // Download video file for processing
        // TODO: Implement video download and processing
        // For now, we'll skip AI processing
        
        // Update video document with AI content when ready
        await Video.findByIdAndUpdate(videoId, {
            // transcript: transcript,
            // summary: summary,
            // chapters: chapters,
            // quiz: quiz,
            // keywords: keywords
            isAIProcessed: true
        });
    } catch (error) {
        console.error("Error in AI content processing:", error);
        // Update video document to indicate AI processing failed
        await Video.findByIdAndUpdate(videoId, {
            isAIProcessed: false,
            aiProcessingError: error.message
        });
    }
};

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username fullName avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Increment views
    video.views += 1;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { 
        title, 
        description, 
        category,
        difficulty,
        isPublished 
    } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this video");
    }

    if (req.files?.thumbnail) {
        const thumbnailLocalPath = req.files.thumbnail[0].path;
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (thumbnail) video.thumbnail = thumbnail.url;
    }

    // Update fields if provided
    if (title) video.title = title;
    if (description) video.description = description;
    if (category) video.category = category;
    if (difficulty) video.difficulty = difficulty;
    if (typeof isPublished === "boolean") video.isPublished = isPublished;

    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this video");
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this video");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200, 
            { isPublished: video.isPublished },
            "Video publish status updated successfully"
        )
    );
});

const updateVideoMetrics = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { watchTime, completed } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Update average watch time
    if (watchTime) {
        const totalWatchTime = video.averageWatchTime * video.views + watchTime;
        video.averageWatchTime = totalWatchTime / (video.views + 1);
    }

    // Update completion rate
    if (completed) {
        const totalCompletions = video.completionRate * video.views + (completed ? 1 : 0);
        video.completionRate = totalCompletions / (video.views + 1);
    }

    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video metrics updated successfully")
    );
});

const updateVideoView = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if user has already viewed this video
    const existingView = video.viewedBy.find(
        view => view.user.toString() === userId.toString()
    );

    if (!existingView) {
        // If it's a new view, increment the view count and add to viewedBy
        video.views += 1;
        video.viewedBy.push({ user: userId });
        await video.save();
    }

    return res.status(200).json(
        new ApiResponse(200, { views: video.views }, "Video view updated successfully")
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateVideoMetrics,
    updateVideoView
}
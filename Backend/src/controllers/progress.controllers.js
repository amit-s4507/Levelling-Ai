import mongoose from "mongoose";
import { Progress } from "../models/progress.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendLearningMilestoneEmail } from "../utils/emailService.js";

const updateProgress = asyncHandler(async (req, res) => {
    const { videoId } = req.params.videoId ? req.params : req.body;
    const { watchTime, completed } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    let progress = await Progress.findOne({ user: req.user._id, video: videoId });

    if (!progress) {
        progress = await Progress.create({
            user: req.user._id,
            video: videoId,
            watchTime: watchTime || 0,
            completed: completed || false
        });
    } else {
        if (watchTime !== undefined) {
            await progress.updateWatchTime(watchTime);
        }
        if (completed !== undefined) {
            progress.completed = completed;
            await progress.save();
        }
    }

    // Check for learning milestones
    const userProgress = await Progress.find({ user: req.user._id });
    const completedVideos = userProgress.filter(p => p.completed).length;

    // Send milestone emails
    if (completedVideos === 1) {
        await sendLearningMilestoneEmail(req.user, {
            title: "First Video Completed!",
            description: "You've completed your first video. Keep going!"
        });
    } else if (completedVideos === 10) {
        await sendLearningMilestoneEmail(req.user, {
            title: "10 Videos Milestone!",
            description: "You've completed 10 videos. You're becoming a pro!"
        });
    }

    return res.status(200).json(
        new ApiResponse(200, progress, "Progress updated successfully")
    );
});

const submitQuiz = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { answers } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (!video.quiz || !video.quiz.length) {
        throw new ApiError(400, "No quiz available for this video");
    }

    if (!answers || !Array.isArray(answers)) {
        throw new ApiError(400, "Invalid quiz answers");
    }

    // Calculate quiz score
    const totalQuestions = video.quiz.length;
    let correctAnswers = 0;

    answers.forEach((answer, index) => {
        if (video.quiz[index] && answer === video.quiz[index].correctAnswer) {
            correctAnswers++;
        }
    });

    const score = (correctAnswers / totalQuestions) * 100;

    // Update progress
    let progress = await Progress.findOne({ user: req.user._id, video: videoId });
    if (!progress) {
        progress = await Progress.create({
            user: req.user._id,
            video: videoId
        });
    }

    await progress.addQuizAttempt(score, totalQuestions, correctAnswers);

    return res.status(200).json(
        new ApiResponse(200, {
            score,
            totalQuestions,
            correctAnswers,
            progress
        }, "Quiz submitted successfully")
    );
});

const addNote = asyncHandler(async (req, res) => {
    const { videoId } = req.params.videoId ? req.params : req.body;
    const { content, chapterIndex } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Note content is required");
    }

    let progress = await Progress.findOne({ user: req.user._id, video: videoId });
    if (!progress) {
        progress = await Progress.create({
            user: req.user._id,
            video: videoId
        });
    }

    await progress.addNote(content, chapterIndex);

    return res.status(200).json(
        new ApiResponse(200, progress, "Note added successfully")
    );
});

const addBookmark = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, timeInVideo, note } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!title?.trim() || typeof timeInVideo !== 'number') {
        throw new ApiError(400, "Title and time in video are required");
    }

    let progress = await Progress.findOne({ user: req.user._id, video: videoId });
    if (!progress) {
        progress = await Progress.create({
            user: req.user._id,
            video: videoId
        });
    }

    await progress.addBookmark(title, timeInVideo, note);

    return res.status(200).json(
        new ApiResponse(200, progress, "Bookmark added successfully")
    );
});

const getUserProgress = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (videoId && !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const query = { user: req.user._id };
    if (videoId) {
        query.video = videoId;
    }

    const progress = await Progress.find(query)
        .populate('video', 'title duration category difficulty')
        .sort('-lastWatched');

    // Calculate overall statistics
    const stats = {
        totalVideosWatched: progress.filter(p => p.completed).length,
        totalWatchTime: progress.reduce((sum, p) => sum + p.watchTime, 0),
        averageQuizScore: progress.reduce((sum, p) => sum + (p.averageQuizScore || 0), 0) / progress.length || 0,
        totalNotes: progress.reduce((sum, p) => sum + p.notes.length, 0),
        totalBookmarks: progress.reduce((sum, p) => sum + p.bookmarks.length, 0)
    };

    return res.status(200).json(
        new ApiResponse(200, { progress, stats }, "Progress fetched successfully")
    );
});

export {
    updateProgress,
    submitQuiz,
    addNote,
    addBookmark,
    getUserProgress
}; 
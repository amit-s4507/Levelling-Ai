import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as openaiService from "../services/openai.service.js";

const getVideoTranscript = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { transcript: video.transcript }, "Transcript fetched successfully")
    );
});

const getVideoSummary = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { summary: video.summary }, "Summary fetched successfully")
    );
});

const getVideoChapters = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { chapters: video.chapters }, "Chapters fetched successfully")
    );
});

const getVideoQuiz = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { quiz: video.quiz }, "Quiz fetched successfully")
    );
});

const processVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to process this video");
    }

    try {
        // Update processing status
        video.aiProcessingStatus = {
            transcript: "processing",
            summary: "pending",
            chapters: "pending",
            quiz: "pending"
        };
        await video.save();

        // Generate transcript
        const transcript = await openaiService.generateTranscript(video.videoFile);
        video.transcript = transcript;
        video.aiProcessingStatus.transcript = "completed";
        await video.save();

        // Generate summary
        video.aiProcessingStatus.summary = "processing";
        await video.save();
        const summary = await openaiService.generateSummary(transcript);
        video.summary = summary;
        video.aiProcessingStatus.summary = "completed";
        await video.save();

        // Detect chapters
        video.aiProcessingStatus.chapters = "processing";
        await video.save();
        const chapters = await openaiService.detectChapters(transcript);
        video.chapters = chapters;
        video.aiProcessingStatus.chapters = "completed";
        await video.save();

        // Generate quiz
        video.aiProcessingStatus.quiz = "processing";
        await video.save();
        const quiz = await openaiService.generateQuiz(transcript);
        video.quiz = quiz;
        video.aiProcessingStatus.quiz = "completed";
        await video.save();

        // Extract keywords and learning objectives
        const [keywords, learningObjectives] = await Promise.all([
            openaiService.extractKeywords(transcript),
            openaiService.generateLearningObjectives(transcript)
        ]);
        video.keywords = keywords;
        video.learningObjectives = learningObjectives;
        await video.save();

        return res.status(200).json(
            new ApiResponse(200, video, "Video processed successfully")
        );
    } catch (error) {
        // Update processing status to failed
        video.aiProcessingStatus = {
            transcript: video.transcript ? "completed" : "failed",
            summary: video.summary ? "completed" : "failed",
            chapters: video.chapters.length > 0 ? "completed" : "failed",
            quiz: video.quiz.length > 0 ? "completed" : "failed"
        };
        await video.save();

        throw new ApiError(500, "Failed to process video: " + error.message);
    }
});

const getVideoInsights = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId).select(
        "transcript summary chapters quiz keywords learningObjectives aiProcessingStatus"
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video insights retrieved successfully")
    );
});

const askQuestion = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { question } = req.body;

    if (!question?.trim()) {
        throw new ApiError(400, "Question is required");
    }

    const video = await Video.findById(videoId).select("transcript summary");
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const context = `Transcript:\n${video.transcript}\n\nSummary:\n${video.summary}`;
    const answer = await openaiService.answerQuestion(question, context);

    return res.status(200).json(
        new ApiResponse(200, { answer }, "Question answered successfully")
    );
});

const getVideoProgress = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId).select("aiProcessingStatus");
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video.aiProcessingStatus, "Processing status retrieved successfully")
    );
});

const generatePersonalizedPlan = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { userId } = req.user;

    const video = await Video.findById(videoId).select("transcript summary learningObjectives");
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Generate personalized learning plan based on video content and user data
    const learningPlan = await openaiService.generateLearningPlan(
        video.transcript,
        video.summary,
        video.learningObjectives
    );

    return res.status(200).json(
        new ApiResponse(200, { learningPlan }, "Personalized learning plan generated successfully")
    );
});

export {
    getVideoTranscript,
    getVideoSummary,
    getVideoChapters,
    getVideoQuiz,
    processVideo,
    getVideoInsights,
    askQuestion,
    getVideoProgress,
    generatePersonalizedPlan
}; 
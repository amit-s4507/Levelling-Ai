import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { chatWithAI } from "../utils/openai.js";

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

const askQuestion = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { question } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!question?.trim()) {
        throw new ApiError(400, "Question is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Create context from video content
    const context = `
        Title: ${video.title}
        Description: ${video.description}
        Transcript: ${video.transcript}
        Summary: ${video.summary}
    `;

    const messages = [
        {
            role: "user",
            content: question
        }
    ];

    const answer = await chatWithAI(messages, context);

    return res.status(200).json(
        new ApiResponse(200, { answer }, "Answer generated successfully")
    );
});

const generatePersonalizedPlan = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { learningStyle, goals } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const context = `
        Content: ${video.title}
        Learning Style: ${learningStyle}
        Goals: ${goals}
        Difficulty: ${video.difficulty}
        Topics: ${video.keywords.join(", ")}
    `;

    const messages = [
        {
            role: "system",
            content: "Create a personalized learning plan based on the user's learning style and goals."
        },
        {
            role: "user",
            content: `Generate a structured learning plan for this content.
                     Consider the learning style: ${learningStyle}
                     And these goals: ${goals}`
        }
    ];

    const plan = await chatWithAI(messages, context);

    return res.status(200).json(
        new ApiResponse(200, { plan }, "Learning plan generated successfully")
    );
});

export {
    getVideoTranscript,
    getVideoSummary,
    getVideoChapters,
    getVideoQuiz,
    askQuestion,
    generatePersonalizedPlan
}; 
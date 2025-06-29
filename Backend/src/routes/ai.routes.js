import { Router } from "express";
import {
    getVideoTranscript,
    getVideoSummary,
    getVideoChapters,
    getVideoQuiz,
    askQuestion,
    generatePersonalizedPlan,
    processVideo,
    getVideoInsights,
    getVideoProgress
} from "../controllers/ai.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Video content routes
router.get("/videos/:videoId/transcript", getVideoTranscript);
router.get("/videos/:videoId/summary", getVideoSummary);
router.get("/videos/:videoId/chapters", getVideoChapters);
router.get("/videos/:videoId/quiz", getVideoQuiz);

// Interactive AI features
router.post("/videos/:videoId/ask", askQuestion);
router.post("/videos/:videoId/learning-plan", generatePersonalizedPlan);

router.post("/videos/:videoId/process", processVideo);
router.get("/videos/:videoId/insights", getVideoInsights);
router.get("/videos/:videoId/progress", getVideoProgress);

export default router; 
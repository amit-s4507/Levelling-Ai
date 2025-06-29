import { Router } from 'express';
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Public routes (no authentication needed)
router.get('/', (req, res) => {
    res.json({
        name: "EduTube AI",
        version: "1.0.0",
        description: "An intelligent educational video platform",
        features: [
            "AI-powered video analysis",
            "Automatic transcription",
            "Smart chapter generation",
            "Quiz generation",
            "Progress tracking",
            "Learning analytics"
        ],
        endpoints: {
            auth: ["/api/v1/users/register", "/api/v1/users/login"],
            videos: ["/api/v1/videos", "/api/v1/videos/:videoId"],
            ai: ["/api/v1/ai/transcript", "/api/v1/ai/summary", "/api/v1/ai/quiz"],
            progress: ["/api/v1/progress/update", "/api/v1/progress/notes"]
        }
    });
});

// Protected routes (authentication needed)
router.get('/stats', verifyJWT, (req, res) => {
    res.json({
        totalUsers: 1000,
        totalVideos: 500,
        totalWatchTime: "5000 hours",
        averageCompletionRate: "85%",
        popularCategories: ["Technology", "Science", "Mathematics"],
        activeUsers: 250
    });
});

export default router;

import { Router } from "express";
import {
    updateProgress,
    submitQuiz,
    addNote,
    addBookmark,
    getUserProgress
} from "../controllers/progress.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Progress tracking routes
router.post("/update", updateProgress);
router.post("/videos/:videoId/progress", updateProgress);
router.get("/videos", getUserProgress);
router.get("/videos/:videoId", getUserProgress);

// Quiz routes
router.post("/videos/:videoId/quiz", submitQuiz);

// Notes and bookmarks
router.post("/note", addNote);
router.post("/videos/:videoId/notes", addNote);
router.post("/videos/:videoId/bookmarks", addBookmark);

export default router; 
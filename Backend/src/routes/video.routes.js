import { Router } from 'express';
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    updateVideoView
} from '../controllers/video.controllers.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Video CRUD routes
router.route('/')
    .get(getAllVideos)
    .post(
        upload.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 }
        ]),
        publishAVideo
    );

router.route('/:videoId')
    .get(getVideoById)
    .patch(upload.single("thumbnail"), updateVideo)
    .delete(deleteVideo);

// View tracking route
router.patch('/view/:videoId', updateVideoView);

export default router;
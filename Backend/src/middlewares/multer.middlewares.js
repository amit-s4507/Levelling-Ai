import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure temp directory exists
const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "videoFile") {
    // Accept video files
    if (!file.originalname.match(/\.(mp4|webm|mkv|avi|mov)$/i)) {
      return cb(new Error('Only video files are allowed!'), false);
    }
  } else if (file.fieldname === "thumbnail" || file.fieldname === "avatar" || file.fieldname === "coverImage") {
    // Accept image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
  }
  cb(null, true);
};

const videoSizeLimit = 100 * 1024 * 1024; // 100MB
const imageSizeLimit = 5 * 1024 * 1024;   // 5MB

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: videoSizeLimit, // This will be overridden for image fields
  }
});

// Create specialized upload middleware for different scenarios
export const uploadVideo = upload.fields([
  { name: 'videoFile', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

export const uploadUserFiles = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

export { upload};
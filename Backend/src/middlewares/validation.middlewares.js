import { body, param, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        throw new ApiError(400, firstError.msg);
    }
    next();
};

// Video validation rules
export const validateVideoUpload = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 5000 })
        .withMessage('Description must be between 10 and 5000 characters'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required'),
    body('difficulty')
        .optional()
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Invalid difficulty level'),
    handleValidationErrors
];

// AI feature validation rules
export const validateQuestionRequest = [
    param('videoId')
        .isMongoId()
        .withMessage('Invalid video ID'),
    body('question')
        .trim()
        .notEmpty()
        .withMessage('Question is required')
        .isLength({ min: 10, max: 500 })
        .withMessage('Question must be between 10 and 500 characters'),
    handleValidationErrors
];

export const validateLearningPlanRequest = [
    param('videoId')
        .isMongoId()
        .withMessage('Invalid video ID'),
    body('learningStyle')
        .trim()
        .notEmpty()
        .withMessage('Learning style is required'),
    body('goals')
        .trim()
        .notEmpty()
        .withMessage('Learning goals are required')
        .isLength({ min: 10, max: 500 })
        .withMessage('Goals must be between 10 and 500 characters'),
    handleValidationErrors
];

// User validation rules
export const validateUserRegistration = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format'),
    body('fullName')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    handleValidationErrors
];

// Comment validation rules
export const validateCommentCreation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters'),
    handleValidationErrors
];

// Playlist validation rules
export const validatePlaylistCreation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Playlist name is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Playlist name must be between 3 and 50 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Description cannot exceed 200 characters'),
    handleValidationErrors
]; 
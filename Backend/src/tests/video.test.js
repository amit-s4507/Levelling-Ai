import mongoose from 'mongoose';
import { Video } from '../models/video.models.js';
import { User } from '../models/user.models.js';

describe('Video Model Test', () => {
    beforeAll(async () => {
        // Connect to a test database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutube-ai-test');
    });

    afterAll(async () => {
        // Cleanup the database and close connection
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear the database before each test
        await Video.deleteMany({});
        await User.deleteMany({});
    });

    it('should create a video successfully', async () => {
        const validVideo = {
            videoFile: 'https://example.com/video.mp4',
            thumbnail: 'https://example.com/thumbnail.jpg',
            title: 'Test Video',
            description: 'Test Description',
            duration: 120,
            category: 'Technology',
            difficulty: 'intermediate'
        };

        const video = new Video(validVideo);
        const savedVideo = await video.save();
        
        expect(savedVideo._id).toBeDefined();
        expect(savedVideo.title).toBe(validVideo.title);
        expect(savedVideo.description).toBe(validVideo.description);
        expect(savedVideo.duration).toBe(validVideo.duration);
        expect(savedVideo.views).toBe(0);
        expect(savedVideo.isPublished).toBe(true);
    });

    it('should fail to create a video without required fields', async () => {
        const invalidVideo = {
            title: 'Test Video'
        };

        try {
            const video = new Video(invalidVideo);
            await video.save();
        } catch (error) {
            expect(error).toBeDefined();
            expect(error.errors.videoFile).toBeDefined();
            expect(error.errors.thumbnail).toBeDefined();
            expect(error.errors.description).toBeDefined();
            expect(error.errors.duration).toBeDefined();
        }
    });

    it('should update video views correctly', async () => {
        const video = new Video({
            videoFile: 'https://example.com/video.mp4',
            thumbnail: 'https://example.com/thumbnail.jpg',
            title: 'Test Video',
            description: 'Test Description',
            duration: 120,
            category: 'Technology',
            difficulty: 'intermediate'
        });

        await video.save();
        
        video.views += 1;
        await video.save();

        const updatedVideo = await Video.findById(video._id);
        expect(updatedVideo.views).toBe(1);
    });

    it('should handle AI-generated content', async () => {
        const videoWithAI = {
            videoFile: 'https://example.com/video.mp4',
            thumbnail: 'https://example.com/thumbnail.jpg',
            title: 'Test Video',
            description: 'Test Description',
            duration: 120,
            category: 'Technology',
            difficulty: 'intermediate',
            transcript: 'Test transcript',
            summary: 'Test summary',
            chapters: [{
                title: 'Chapter 1',
                startTime: 0,
                endTime: 60,
                summary: 'Chapter summary'
            }],
            keywords: ['test', 'video', 'ai'],
            quiz: [{
                question: 'Test question?',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 0,
                explanation: 'Test explanation'
            }]
        };

        const video = new Video(videoWithAI);
        const savedVideo = await video.save();

        expect(savedVideo.transcript).toBe(videoWithAI.transcript);
        expect(savedVideo.summary).toBe(videoWithAI.summary);
        expect(savedVideo.chapters).toHaveLength(1);
        expect(savedVideo.keywords).toHaveLength(3);
        expect(savedVideo.quiz).toHaveLength(1);
    });
}); 
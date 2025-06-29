import mongoose from 'mongoose';
import { Progress } from '../models/progress.models.js';
import { Video } from '../models/video.models.js';
import { User } from '../models/user.models.js';

describe('Progress Model Test', () => {
    let testUser;
    let testVideo;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutube-ai-test');
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Progress.deleteMany({});
        await Video.deleteMany({});
        await User.deleteMany({});

        // Create test user
        testUser = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            fullName: 'Test User',
            password: 'Password123!',
            avatar: 'https://example.com/avatar.jpg'
        });

        // Create test video
        testVideo = await Video.create({
            videoFile: 'https://example.com/video.mp4',
            thumbnail: 'https://example.com/thumbnail.jpg',
            title: 'Test Video',
            description: 'Test Description',
            duration: 120,
            category: 'Technology',
            difficulty: 'intermediate'
        });
    });

    it('should create progress record successfully', async () => {
        const progress = new Progress({
            user: testUser._id,
            video: testVideo._id,
            watchTime: 60,
            completed: false
        });

        const savedProgress = await progress.save();
        
        expect(savedProgress._id).toBeDefined();
        expect(savedProgress.user.toString()).toBe(testUser._id.toString());
        expect(savedProgress.video.toString()).toBe(testVideo._id.toString());
        expect(savedProgress.watchTime).toBe(60);
        expect(savedProgress.completed).toBe(false);
    });

    it('should update watch time and completion status', async () => {
        const progress = await Progress.create({
            user: testUser._id,
            video: testVideo._id,
            watchTime: 0,
            completed: false
        });

        await progress.updateWatchTime(110); // More than 90% of video duration (120)

        const updatedProgress = await Progress.findById(progress._id);
        expect(updatedProgress.watchTime).toBe(110);
        expect(updatedProgress.completed).toBe(true); // Should be marked as completed
    });

    it('should add quiz attempt', async () => {
        const progress = await Progress.create({
            user: testUser._id,
            video: testVideo._id
        });

        await progress.addQuizAttempt(85, 10, 8.5);

        const updatedProgress = await Progress.findById(progress._id);
        expect(updatedProgress.quizAttempts).toHaveLength(1);
        expect(updatedProgress.quizAttempts[0].score).toBe(85);
        expect(updatedProgress.quizAttempts[0].questionsAnswered).toBe(10);
        expect(updatedProgress.quizAttempts[0].correctAnswers).toBe(8.5);
    });

    it('should add note', async () => {
        const progress = await Progress.create({
            user: testUser._id,
            video: testVideo._id
        });

        await progress.addNote('Test note content', 1);

        const updatedProgress = await Progress.findById(progress._id);
        expect(updatedProgress.notes).toHaveLength(1);
        expect(updatedProgress.notes[0].content).toBe('Test note content');
        expect(updatedProgress.notes[0].chapterIndex).toBe(1);
    });

    it('should add bookmark', async () => {
        const progress = await Progress.create({
            user: testUser._id,
            video: testVideo._id
        });

        await progress.addBookmark('Important point', 45, 'Remember this part');

        const updatedProgress = await Progress.findById(progress._id);
        expect(updatedProgress.bookmarks).toHaveLength(1);
        expect(updatedProgress.bookmarks[0].title).toBe('Important point');
        expect(updatedProgress.bookmarks[0].timeInVideo).toBe(45);
        expect(updatedProgress.bookmarks[0].note).toBe('Remember this part');
    });

    it('should calculate completion percentage', async () => {
        const progress = await Progress.create({
            user: testUser._id,
            video: testVideo._id,
            watchTime: 60 // Half of video duration (120)
        });

        const percentage = await progress.completionPercentage;
        expect(percentage).toBe(50);
    });

    it('should calculate average quiz score', async () => {
        const progress = await Progress.create({
            user: testUser._id,
            video: testVideo._id
        });

        await progress.addQuizAttempt(80, 10, 8);
        await progress.addQuizAttempt(90, 10, 9);

        const updatedProgress = await Progress.findById(progress._id);
        expect(updatedProgress.averageQuizScore).toBe(85);
    });
}); 
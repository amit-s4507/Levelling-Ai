import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendWelcomeEmail = async (user) => {
    try {
        await transporter.sendMail({
            from: `"EduTube AI" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Welcome to EduTube AI!",
            html: `
                <h1>Welcome to EduTube AI, ${user.fullName}!</h1>
                <p>We're excited to have you join our learning platform. Here's what you can do:</p>
                <ul>
                    <li>Upload educational videos</li>
                    <li>Learn with AI-powered features</li>
                    <li>Take quizzes and track your progress</li>
                    <li>Interact with other learners</li>
                </ul>
                <p>Get started by exploring our video library or uploading your first video!</p>
            `
        });
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};

export const sendVideoPublishedEmail = async (user, video) => {
    try {
        await transporter.sendMail({
            from: `"EduTube AI" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Your Video is Live!",
            html: `
                <h1>Your video "${video.title}" is now live!</h1>
                <p>We've processed your video and generated:</p>
                <ul>
                    <li>AI-powered transcript</li>
                    <li>Smart chapter divisions</li>
                    <li>Interactive quiz</li>
                    <li>Learning resources</li>
                </ul>
                <p>View your video and track its performance in your dashboard.</p>
            `
        });
    } catch (error) {
        console.error("Error sending video published email:", error);
    }
};

export const sendLearningMilestoneEmail = async (user, milestone) => {
    try {
        await transporter.sendMail({
            from: `"EduTube AI" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Congratulations on Your Learning Milestone!",
            html: `
                <h1>Congratulations, ${user.fullName}!</h1>
                <p>You've achieved a new learning milestone:</p>
                <h2>${milestone.title}</h2>
                <p>${milestone.description}</p>
                <p>Keep up the great work and continue your learning journey!</p>
            `
        });
    } catch (error) {
        console.error("Error sending milestone email:", error);
    }
};

export const sendWeeklyProgressEmail = async (user, progress) => {
    try {
        await transporter.sendMail({
            from: `"EduTube AI" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Your Weekly Learning Progress",
            html: `
                <h1>Weekly Progress Report</h1>
                <p>Here's your learning progress this week:</p>
                <ul>
                    <li>Videos watched: ${progress.videosWatched}</li>
                    <li>Time spent learning: ${progress.timeSpent} minutes</li>
                    <li>Quizzes completed: ${progress.quizzesCompleted}</li>
                    <li>Average quiz score: ${progress.averageScore}%</li>
                </ul>
                <p>Keep learning and growing with EduTube AI!</p>
            `
        });
    } catch (error) {
        console.error("Error sending progress email:", error);
    }
}; 
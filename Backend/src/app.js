import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { rateLimit } from 'express-rate-limit'
import helmet from "helmet"
import morgan from "morgan"
import { logger, stream, logError, logAPIRequest } from "./utils/logger.js"

const app = express()

// Security middleware with video streaming support
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500 // limit each IP to 500 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())
console.log("app.js----", process.env.CORS_ORIGIN)

//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import aboutRouter from "./routes/about.routes.js"
import aiRouter from "./routes/ai.routes.js"
import progressRouter from "./routes/progress.routes.js"

//routes declaration
// http://localhost:9000/api/v1/

app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/about", aboutRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/progress", progressRouter);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : null
    });
});

// Handle 404 routes
app.use((req, res) => {
    logger.warn('Route not found', {
        method: req.method,
        url: req.url
    });
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

export { app }
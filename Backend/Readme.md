# EduTube AI Backend

A powerful backend for an intelligent educational video platform that leverages AI to enhance learning experiences.

## Features

### 🎥 Video Management
- Upload and manage educational videos
- Automatic video processing and thumbnail generation
- Video categorization and difficulty levels
- View tracking and analytics

### 🤖 AI Features
- Automatic transcript generation using OpenAI Whisper
- Smart video summarization
- Automatic chapter detection and segmentation
- Keyword extraction and topic modeling
- AI-powered quiz generation
- Intelligent Q&A system for video content

### 📊 Learning Progress
- Track user watch time and completion rates
- Quiz attempt tracking and scoring
- Note-taking functionality
- Video bookmarking
- Learning path recommendations
- Progress analytics and insights

### 👥 User Management
- User authentication and authorization
- Profile management
- Learning preferences
- Progress tracking
- Email notifications for milestones

### 🔒 Security Features
- JWT-based authentication
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose
- OpenAI API Integration
- JWT Authentication
- Winston Logger
- Express Validator
- Cloudinary for Media Storage
- Nodemailer for Emails

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB
- OpenAI API Key
- Cloudinary Account
- Gmail Account (for email notifications)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd edutube-ai/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file:
   ```env
   # Server Configuration
   PORT=9000
   CORS_ORIGIN=http://localhost:5173

   # Database
   MONGODB_URI=your_mongodb_uri

   # Authentication
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=7d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-3.5-turbo

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Features Toggle
   ENABLE_AI_FEATURES=true
   ENABLE_QUIZ_GENERATION=true
   ENABLE_CHATBOT=true

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Video Endpoints

- `POST /api/v1/videos` - Upload a new video
- `GET /api/v1/videos` - Get all videos
- `GET /api/v1/videos/:videoId` - Get video details
- `PUT /api/v1/videos/:videoId` - Update video
- `DELETE /api/v1/videos/:videoId` - Delete video

### AI Endpoints

- `GET /api/v1/ai/videos/:videoId/transcript` - Get video transcript
- `GET /api/v1/ai/videos/:videoId/summary` - Get video summary
- `GET /api/v1/ai/videos/:videoId/chapters` - Get video chapters
- `GET /api/v1/ai/videos/:videoId/quiz` - Get video quiz
- `POST /api/v1/ai/videos/:videoId/ask` - Ask questions about video
- `POST /api/v1/ai/videos/:videoId/learning-plan` - Get personalized learning plan

### Progress Endpoints

- `POST /api/v1/progress/videos/:videoId/progress` - Update learning progress
- `GET /api/v1/progress/videos/:videoId?` - Get user progress
- `POST /api/v1/progress/videos/:videoId/quiz` - Submit quiz attempt
- `POST /api/v1/progress/videos/:videoId/notes` - Add notes
- `POST /api/v1/progress/videos/:videoId/bookmarks` - Add bookmarks

### User Endpoints

- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

## Error Handling

The API uses a consistent error response format:

```json
{
    "success": false,
    "message": "Error message",
    "error": "Detailed error (development only)"
}
```

## Logging

Logs are stored in the `logs` directory:
- `error.log` - Error logs
- `combined.log` - All logs
- Console output in development

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@edutube-ai.com or join our Discord channel.


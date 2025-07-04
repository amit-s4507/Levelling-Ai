# Levelling AI - Educational Video Platform

An AI-powered educational video platform that helps users learn effectively through smart content analysis and personalized learning paths.

## Project Structure

```
Levelling AI/
├── Backend/           # Node.js & Express backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Utility functions
│   │   └── middlewares/ # Express middlewares
│   └── public/         # Public assets
└── Frontend/          # React & Vite frontend
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── context/     # React context
    │   └── services/    # API services
    └── public/         # Static assets
```

## Features

- 🎥 Video upload and streaming
- 🤖 AI-powered video analysis
- 📝 Auto-generated transcripts and summaries
- 📊 Progress tracking
- 📚 Notes and bookmarks
- 🧠 Smart quiz generation
- 👥 User authentication and profiles

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Cloudinary account
- OpenAI API key

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd levelling-ai
   ```

2. Backend Setup:
   ```bash
   cd Backend
   npm install
   cp .env.example .env  # Copy and configure environment variables
   npm run dev
   ```

3. Frontend Setup:
   ```bash
   cd Frontend
   npm install
   cp .env.example .env  # Copy and configure environment variables
   npm run dev
   ```

4. Configure environment variables:
   - Backend `.env`: Configure MongoDB, Cloudinary, OpenAI, and JWT settings
   - Frontend `.env`: Set API base URL and feature flags

## API Documentation

### Authentication
- POST `/api/v1/users/register` - Register new user
- POST `/api/v1/users/login` - User login
- POST `/api/v1/users/logout` - User logout

### Videos
- POST `/api/v1/videos` - Upload new video
- GET `/api/v1/videos` - List all videos
- GET `/api/v1/videos/:videoId` - Get video details

### Progress
- POST `/api/v1/progress/update` - Update video progress
- POST `/api/v1/progress/note` - Add note to video
- GET `/api/v1/progress/videos` - Get user's progress

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

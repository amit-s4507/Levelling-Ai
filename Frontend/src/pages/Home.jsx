import React, { useEffect, useState } from 'react';
import { videoAPI } from '../services/api';
import VideoGrid from '../components/video/VideoGrid';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    videoAPI.getAllVideos()
      .then((res) => {
        setVideos(res.data?.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch videos:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to EduTube AI</h1>
        <p className="mt-2 text-gray-600">
          Discover educational videos enhanced with AI-powered features
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}

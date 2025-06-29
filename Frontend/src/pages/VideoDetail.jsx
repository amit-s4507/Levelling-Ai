import React from 'react';
import { useParams } from 'react-router-dom';

const VideoDetail = () => {
  const { videoId } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Video Details</h1>
        <p className="mt-2 text-gray-600">
          Video ID: {videoId}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500 text-center">Video player and AI features coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail; 
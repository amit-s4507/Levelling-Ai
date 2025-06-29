import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { videoAPI, likeAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const VideoDetail = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [viewUpdated, setViewUpdated] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await videoAPI.getVideoById(videoId);
        setVideo(response.data);
        
        // Update view count only if not already updated
        if (!viewUpdated) {
          await videoAPI.updateView(videoId);
          setViewUpdated(true);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error fetching video');
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId, viewUpdated]);

  const handleLike = async () => {
    try {
      await likeAPI.toggleLike({ videoId });
      const response = await videoAPI.getVideoById(videoId);
      setVideo(response.data);
      toast.success('Like updated successfully');
    } catch (err) {
      toast.error(err.message || 'Error updating like');
    }
  };

  const handleVideoError = (e) => {
    console.error('Video playback error:', e);
    setVideoError('Error playing video. Please try again later.');
    toast.error('Error playing video. Please try again later.');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Video Player */}
      <div className="aspect-w-16 aspect-h-9 mb-8">
        {videoError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">{videoError}</p>
              <button
                onClick={() => setVideoError(null)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <video
            className="w-full h-full rounded-lg shadow-lg object-cover"
            controls
            poster={video.thumbnail}
            src={video.videoFile}
            preload="metadata"
            onError={handleVideoError}
            crossOrigin="anonymous"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Video Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{video.title}</h1>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>{video.views} views</span>
              <span className="mx-2">•</span>
              <span>{video.difficulty}</span>
              <span className="mx-2">•</span>
              <span>{video.category}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Like ({video.engagement?.likes || 0})
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Description</h2>
          <p className="mt-2 text-gray-600 whitespace-pre-wrap">{video.description}</p>
        </div>

        {/* Creator Info */}
        <div className="mt-6 flex items-center">
          <img
            className="h-10 w-10 rounded-full"
            src={video.owner?.avatar}
            alt={video.owner?.username}
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{video.owner?.fullName}</p>
            <p className="text-sm text-gray-500">@{video.owner?.username}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail; 
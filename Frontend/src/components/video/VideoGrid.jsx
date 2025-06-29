import React from 'react';
import VideoCard from './VideoCard';

export const VideoGrid = ({ videos }) => {
  if (!videos?.length) {
    return <p className="text-gray-500 text-center">No videos found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
};

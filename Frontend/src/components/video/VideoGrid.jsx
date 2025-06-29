import React from 'react';
import VideoCard from './VideoCard';

export default function VideoGrid({ videos }) {
  if (!videos?.length) {
    return <p className="text-gray-500 text-center">No videos found.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}

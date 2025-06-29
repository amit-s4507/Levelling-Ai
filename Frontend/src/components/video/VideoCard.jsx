import React from 'react';

export default function VideoCard({ video }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      <img
        src={video.thumbnail || "https://via.placeholder.com/320x180.png?text=Thumbnail"}
        alt={video.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{video.title}</h2>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {video.description?.slice(0, 80) || 'No description'}...
        </p>
        <p className="text-xs text-blue-500 mt-2">Duration: {video.duration || 'N/A'}</p>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  const {
    _id,
    title,
    description,
    thumbnail,
    duration,
    views,
    createdAt,
    owner,
    isPublished
  } = video;

  // Format view count
  const formatViews = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count;
  };

  // Format duration
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link to={`/video/${_id}`} className="group">
      <div className="bg-card rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
        {/* Thumbnail */}
        <div className="relative aspect-video">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </div>
          )}
          {!isPublished && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              Draft
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Owner Avatar */}
            <img
              src={owner?.avatar}
              alt={owner?.username}
              className="w-8 h-8 rounded-full"
            />
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-foreground font-medium line-clamp-2 group-hover:text-primary">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {owner?.fullName || owner?.username}
              </p>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span>{formatViews(views)} views</span>
                <span className="mx-1">•</span>
                <span>{formatDate(createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;

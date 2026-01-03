/**
 * Enhanced media gallery component with IMAGE and VIDEO support
 * Optimized for Raspberry Pi with lazy loading and video controls
 */

import React, { useState } from 'react';
import useSpotMedia from '../hooks/useSpotMedia';

const SpotMediaGallery = ({ municipality, spotName }) => {
  const { images, videos, thumbnail, categories, hasVideo, mediaCount, loading, error } = useSpotMedia(municipality, spotName);
  const [activeTab, setActiveTab] = useState('images'); // 'images' or 'videos'
  const [selectedMedia, setSelectedMedia] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>Error loading media: {error}</p>
      </div>
    );
  }

  if (mediaCount.total === 0) {
    return (
      <div className="p-4 bg-gray-50 text-gray-600 rounded-lg">
        <p>No media available for {spotName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{spotName}</h3>
          <p className="text-sm text-gray-500">
            {mediaCount.images} image{mediaCount.images !== 1 ? 's' : ''}
            {hasVideo && ` • ${mediaCount.videos} video${mediaCount.videos !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          {categories.map((category, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs for Images/Videos */}
      {hasVideo && (
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'images'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Images ({mediaCount.images})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'videos'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Videos ({mediaCount.videos})
          </button>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'images' && images.length > 0 && (
        <div className="space-y-4">
          {/* Featured/Thumbnail Image */}
          {thumbnail && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
              <img
                src={thumbnail}
                alt={`${spotName} - featured`}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                loading="lazy"
                onClick={() => setSelectedMedia({ type: 'image', url: thumbnail })}
              />
            </div>
          )}

          {/* Image Grid */}
          {images.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.slice(1).map((image, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 cursor-pointer"
                  onClick={() => setSelectedMedia({ type: 'image', url: image })}
                >
                  <img
                    src={image}
                    alt={`${spotName} - ${idx + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && videos.length > 0 && (
        <div className="space-y-4">
          {videos.map((video, idx) => (
            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <video
                controls
                preload="metadata"
                className="w-full h-full"
                poster={thumbnail}
              >
                <source src={video} type="video/mp4" />
                <source src={video.replace('.mp4', '.webm')} type="video/webm" />
                Your browser does not support the video tag.
              </video>
              <p className="mt-2 text-sm text-gray-600">
                Video {idx + 1} of {videos.length}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            onClick={() => setSelectedMedia(null)}
          >
            &times;
          </button>
          {selectedMedia.type === 'image' ? (
            <img
              src={selectedMedia.url}
              alt={spotName}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video
              controls
              autoPlay
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <source src={selectedMedia.url} type="video/mp4" />
            </video>
          )}
        </div>
      )}
    </div>
  );
};

export default SpotMediaGallery;

// Usage:
// <SpotMediaGallery municipality="BARAS" spotName="Binurong Point" />

/**
 * Example component showing how to use the new image manifest system
 * Optimized for Raspberry Pi performance
 */

import React from 'react';
import useSpotImages from '../hooks/useSpotImages';

const SpotImageGallery = ({ municipality, spotName }) => {
  const { images, thumbnail, categories, loading, error } = useSpotImages(municipality, spotName);

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
        <p>Error loading images: {error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="p-4 bg-gray-50 text-gray-600 rounded-lg">
        <p>No images available for {spotName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{spotName}</h3>
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

      {/* Main Image */}
      {thumbnail && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
          <img
            src={thumbnail}
            alt={`${spotName} - main`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Image Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.slice(1).map((image, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-200"
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
  );
};

export default SpotImageGallery;

// Usage example:
// <SpotImageGallery municipality="BARAS" spotName="Binurong Point" />

/**
 * Reusable Image Marker Component for Map
 * Displays a rounded square image marker with hover effects
 * Used for all tourist spots on the map
 */

import React from 'react';

const ImageMarker = ({ imageUrl, spotName, onClick }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      {/* Image Icon */}
      <div
        className="image-marker-icon"
        style={{
          width: '60px',
          height: '60px',
          minWidth: '60px',
          minHeight: '60px',
          maxWidth: '60px',
          maxHeight: '60px',
          borderRadius: '50%', // Changed to perfect circle
          overflow: 'hidden',
          backgroundColor: '#000000', // Black background
          border: '3px solid #000000', // Black border
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={spotName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div style="
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background-color: #000000;
                ">
                  <i class="fa-solid fa-location-dot" style="font-size: 28px; color: #ffffff;"></i>
                </div>
              `;
            }}
          />
        ) : (
          // Fallback with black background and white icon
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000000', // Black background
              padding: '2px' // Adds small padding so icon doesn't touch edges
            }}
          >
            <i 
              className="fa-solid fa-location-dot" 
              style={{ 
                fontSize: '28px', // Slightly smaller to fit better
                color: '#ffffff', // White icon
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} 
            />
          </div>
        )}
      </div>

      {/* Label */}
      <div
        className="marker-label"
        style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#000000',
          textShadow: `
            -1px -1px 0 #fff,
            1px -1px 0 #fff,
            -1px 1px 0 #fff,
            1px 1px 0 #fff,
            -1.5px 0 0 #fff,
            1.5px 0 0 #fff,
            0 -1.5px 0 #fff,
            0 1.5px 0 #fff
          `,
          marginTop: '6px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          textAlign: 'center',
          lineHeight: '1.2',
          opacity: 1,
          transition: 'opacity 0.3s ease'
        }}
      >
        {spotName}
      </div>
    </div>
  );
};

export default ImageMarker;

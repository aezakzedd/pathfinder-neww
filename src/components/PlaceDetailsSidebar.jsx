import { X, MapPin, Star, Clock, DollarSign, Phone, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PlaceDetailsSidebar({ place, isOpen, onClose, onCloseModal }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset image index when place changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [place]);

  // Handle sidebar animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!place) return null;

  const handleClose = () => {
    // Close both sidebar and modal
    if (onCloseModal) {
      onCloseModal();
    } else if (onClose) {
      onClose();
    }
  };

  const nextImage = () => {
    if (place.images && place.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
    }
  };

  const previousImage = () => {
    if (place.images && place.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length);
    }
  };

  // Default data for demonstration
  const placeData = {
    name: place.name || 'Unknown Place',
    location: place.location || 'Unknown Location',
    description: place.description || 'A beautiful tourist destination in Catanduanes.',
    rating: place.rating || 4.9,
    reviewCount: place.reviewCount || 28,
    entranceFee: place.entranceFee || { adult: '₱15.00', student: '₱10.00' },
    hours: place.hours || '8:00 AM - 5:00 PM',
    contact: place.contact || '+63 123 456 7890',
    images: place.images || [],
    categories: place.categories || []
  };

  return (
    <>
      {/* NO BACKDROP - sidebar is beside videos, not overlaying */}
      
      {/* Sidebar - positioned beside the video container */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '380px',
          maxWidth: '380px',
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 10000, // Higher than modal to ensure it's on top
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header with close button */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10
          }}
        >
          <button
            onClick={handleClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} color="#111827" strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Image gallery section */}
          <div
            style={{
              width: '100%',
              height: '280px',
              backgroundColor: '#e5e7eb',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {placeData.images.length > 0 ? (
              <>
                <img
                  src={placeData.images[currentImageIndex]}
                  alt={`${placeData.name} ${currentImageIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />

                {/* Image navigation arrows */}
                {placeData.images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>

                    <button
                      onClick={nextImage}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>

                    {/* Image counter */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)'
                      }}
                    >
                      {currentImageIndex + 1} / {placeData.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af'
                }}
              >
                <MapPin size={64} color="#9ca3af" />
              </div>
            )}
          </div>

          {/* Content section */}
          <div style={{ padding: '20px' }}>
            {/* Location */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px'
              }}
            >
              <MapPin size={15} color="#6b7280" />
              <span
                style={{
                  color: '#6b7280',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {placeData.location}
              </span>
            </div>

            {/* Place name */}
            <h2
              style={{
                margin: '0 0 10px 0',
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                lineHeight: '1.2'
              }}
            >
              {placeData.name}
            </h2>

            {/* Rating */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', gap: '3px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(placeData.rating) ? '#fbbf24' : 'none'}
                    color="#fbbf24"
                    strokeWidth={2}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#111827'
                }}
              >
                {placeData.rating}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  color: '#6b7280'
                }}
              >
                ({placeData.reviewCount} reviews)
              </span>
            </div>

            {/* Divider */}
            <div
              style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#e5e7eb',
                margin: '20px 0'
              }}
            />

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <h3
                style={{
                  margin: '0 0 10px 0',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#111827'
                }}
              >
                About this place
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#4b5563'
                }}
              >
                {placeData.description}
              </p>
            </div>

            {/* Divider */}
            <div
              style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#e5e7eb',
                margin: '20px 0'
              }}
            />

            {/* Information cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Entrance Fee */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <DollarSign size={19} color="#111827" strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827'
                    }}
                  >
                    Entrance Fee
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#6b7280',
                      lineHeight: '1.5'
                    }}
                  >
                    Adult: {placeData.entranceFee.adult}<br />
                    Student: {placeData.entranceFee.student}
                  </p>
                </div>
              </div>

              {/* Operating Hours */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Clock size={19} color="#111827" strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827'
                    }}
                  >
                    Operating Hours
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#6b7280'
                    }}
                  >
                    {placeData.hours}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Phone size={19} color="#111827" strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827'
                    }}
                  >
                    Contact
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#6b7280'
                    }}
                  >
                    {placeData.contact}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '24px',
                paddingBottom: '20px'
              }}
            >
              <button
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#84cc16',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#65a30d';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(132, 204, 22, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#84cc16';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Navigation size={17} />
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
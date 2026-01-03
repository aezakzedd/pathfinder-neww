import { X, Star, MapPin } from 'lucide-react';

export default function TouristSpotCard({ spot, onClose }) {
  if (!spot) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '280px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        zIndex: 100,
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        }}
      >
        <X size={16} color="white" strokeWidth={2.5} />
      </button>

      {/* Image section - 75% of card */}
      <div
        style={{
          width: '100%',
          height: '210px',
          backgroundColor: '#e5e7eb',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {spot.image ? (
          <img
            src={spot.image}
            alt={spot.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '14px'
            }}
          >
            <MapPin size={48} color="#9ca3af" />
          </div>
        )}
      </div>

      {/* Details section - 25% of card */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'white'
        }}
      >
        {/* Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '4px'
          }}
        >
          <MapPin size={12} color="#6b7280" />
          <span
            style={{
              color: '#6b7280',
              fontSize: '11px',
              fontWeight: '500'
            }}
          >
            {spot.location}
          </span>
        </div>

        {/* Name */}
        <h3
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {spot.name}
        </h3>

        {/* Rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Star size={12} fill="#111827" color="#111827" />
          <span
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#111827'
            }}
          >
            {spot.rating}
          </span>
          <span
            style={{
              fontSize: '13px',
              color: '#6b7280'
            }}
          >
            ({spot.reviewCount})
          </span>
        </div>
      </div>

      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateX(-50%) translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

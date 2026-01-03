import { memo, useMemo } from 'react';

const FloatingCard = memo(function FloatingCard({ 
  leftContent, 
  rightContent, 
  overlayContent, 
  overlayPointerEvents = 'auto', 
  className = '', 
  ...props 
}) {
  // Memoize inline styles to prevent recreation on every render
  const containerStyle = useMemo(() => ({
    width: '90vw',
    height: '90vh',
    border: '1px solid white',
    borderRadius: '24px',
    backgroundColor: 'transparent',
    display: 'flex',
    gap: '24px',
    padding: '24px',
    boxSizing: 'border-box',
    ...props.style
  }), [props.style]);

  const leftContainerStyle = useMemo(() => ({
    width: '50%',
    height: '100%',
    position: 'relative'
  }), []);

  const leftContentStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    borderRadius: '16px',
    padding: '16px',
    boxSizing: 'border-box'
  }), []);

  const overlayContainerStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    pointerEvents: overlayPointerEvents
  }), [overlayPointerEvents]);

  const rightContainerStyle = useMemo(() => ({
    width: '50%',
    height: '100%',
    backgroundColor: '#1f2937',
    borderRadius: '16px',
    padding: '0',
    boxSizing: 'border-box',
    overflow: 'hidden'
  }), []);

  return (
    <div 
      className={`floating-card ${className}`}
      style={containerStyle}
      {...props}
    >
      {/* Left container with overlay */}
      <div style={leftContainerStyle}>
        {/* Base left container */}
        <div style={leftContentStyle}>
          {leftContent}
        </div>
        
        {/* Overlay container */}
        {overlayContent && (
          <div style={overlayContainerStyle}>
            {overlayContent}
          </div>
        )}
      </div>
      
      {/* Right container - for map */}
      <div style={rightContainerStyle}>
        {rightContent}
      </div>
    </div>
  );
});

export default FloatingCard;

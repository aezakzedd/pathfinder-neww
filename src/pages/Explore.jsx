import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { Map, ChevronDown, Calendar, PanelLeft, Edit2, DollarSign, Heart } from 'lucide-react';
import FloatingCard from '../components/FloatingCard';
import MapView from '../components/MapView';
import ChatBot from '../components/ChatBot';
import TravellerInformation from '../components/TravellerInformation';
import NetworkStatus from '../components/NetworkStatus';

export default function Explore() {
  const [isMinimized, setIsMinimized] = useState(true); // Minimized by default
  const [hasMounted, setHasMounted] = useState(false); // Track first mount
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState(null); // Store dates from TravellerInformation
  const [isEditMode, setIsEditMode] = useState(false); // Track if editing preferences
  const containerRef = useRef(null);
  const [translateValues, setTranslateValues] = useState({ x: 0, y: 0 });
  const [isPositionCalculated, setIsPositionCalculated] = useState(false);
  const resizeTimeoutRef = useRef(null);

  // Memoized calculate function to prevent recreation
  const calculateTranslateValues = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      
      // Calculate distance from bottom-right to top-left
      // Adjusted to account for button width when minimized (~160px for text + chevron)
      const translateX = -(width - 160 - 8);
      const translateY = -(height - 40 - 8);
      
      setTranslateValues({ x: translateX, y: translateY });
      setIsPositionCalculated(true);
    }
  }, []);

  // Use useLayoutEffect to calculate position before first paint
  useLayoutEffect(() => {
    calculateTranslateValues();
    // Small delay to ensure position is rendered before enabling animations
    const timer = setTimeout(() => {
      setHasMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [calculateTranslateValues]);

  // Debounced resize handler for better performance
  const handleResize = useCallback(() => {
    // Clear existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    // Debounce resize calculation to avoid excessive calls
    resizeTimeoutRef.current = setTimeout(() => {
      calculateTranslateValues();
    }, 150);
  }, [calculateTranslateValues]);

  useEffect(() => {
    // Add debounced resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  // Memoized toggle handlers to prevent recreation
  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const toggleMapFullscreen = useCallback(() => {
    setIsMapFullscreen(prev => !prev);
  }, []);

  // Handler for when "Get Started" button is clicked in TravellerInformation
  const handleGetStarted = useCallback((dateData) => {
    console.log('handleGetStarted called with:', dateData);
    setSelectedDates(dateData);
    // Minimize the preferences card after selection
    setIsMinimized(true);
    console.log('Selected dates state updated:', dateData);
  }, []);

  // Handler to navigate to map view
  const handleNavigateToMap = useCallback(() => {
    console.log('Navigating to MapView');
    setShowMapView(true);
  }, []);

  // Memoize styles to prevent recreation on every render
  const containerStyle = useMemo(() => ({
    width: '90vw',
    height: '88vh',
    border: '1px solid white',
    borderRadius: '24px',
    backgroundColor: 'transparent',
    display: 'flex',
    gap: '24px',
    padding: '24px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden'
  }), []);

  // Updated to account for 24px gap
  const leftContainerStyle = useMemo(() => ({
    width: 'calc((100% - 24px) / 2)',
    height: '100%',
    position: 'relative',
    overflow: 'hidden'
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
    pointerEvents: isMinimized ? 'none' : 'auto'
  }), [isMinimized]);

  const whiteCardTransformStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transformOrigin: 'bottom right',
    transform: isMinimized 
      ? `translate(${translateValues.x}px, ${translateValues.y}px) scale(0.1)` 
      : 'translate(0, 0) scale(1)',
    // Only animate after first mount
    transition: hasMounted ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    pointerEvents: isMinimized ? 'none' : 'auto',
    willChange: 'transform'
  }), [isMinimized, translateValues.x, translateValues.y, hasMounted]);

  const whiteCardBackgroundStyle = useMemo(() => ({
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: '#434141', // Darker grey background
    borderRadius: '16px',
    padding: '16px',
    boxSizing: 'border-box',
    opacity: isMinimized ? 0 : 1,
    // Only animate after first mount
    transition: hasMounted ? 'opacity 0.4s ease' : 'none',
    willChange: 'opacity',
    overflow: 'hidden'
  }), [isMinimized, hasMounted]);

  const buttonStyle = useMemo(() => ({
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    height: '40px',
    minWidth: '40px',
    borderRadius: isMinimized ? '20px' : '50%',
    backgroundColor: '#84cc16',
    display: (isPositionCalculated && selectedDates) ? 'flex' : 'none', // Only show when dates selected
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: isMinimized ? '0 16px 0 12px' : '0',
    cursor: 'pointer',
    transform: isMinimized 
      ? `translate(${translateValues.x}px, ${translateValues.y}px)` 
      : 'translate(0, 0)',
    // Only animate after first mount
    transition: hasMounted 
      ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, border-radius 0.3s ease, padding 0.3s ease'
      : 'none',
    zIndex: 20,
    pointerEvents: 'auto',
    boxShadow: isMinimized 
      ? '0 4px 20px rgba(132, 204, 22, 0.6)' 
      : '0 2px 8px rgba(0, 0, 0, 0.15)',
    willChange: 'transform, box-shadow',
    whiteSpace: 'nowrap'
  }), [isMinimized, translateValues.x, translateValues.y, hasMounted, isPositionCalculated, selectedDates]);

  // Icon container style with crossfade animation
  const iconContainerStyle = useMemo(() => ({
    position: 'relative',
    width: '20px',
    height: '20px',
    flexShrink: 0
  }), []);

  // Calendar icon style - visible when minimized
  const calendarIconStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: isMinimized ? 1 : 0,
    transform: isMinimized ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(90deg)',
    transition: hasMounted ? 'opacity 0.4s ease, transform 0.4s ease' : 'none',
    willChange: 'opacity, transform'
  }), [isMinimized, hasMounted]);

  // Chevron icon style - visible when expanded
  const chevronIconStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: isMinimized ? 0 : 1,
    transform: isMinimized ? 'scale(0.5) rotate(-90deg)' : 'scale(1) rotate(135deg)',
    transition: hasMounted ? 'opacity 0.4s ease, transform 0.6s ease' : 'none',
    willChange: 'opacity, transform'
  }), [isMinimized, hasMounted]);

  const textStyle = useMemo(() => ({
    color: 'black',
    fontSize: '14px',
    fontWeight: '600',
    opacity: isMinimized ? 1 : 0,
    maxWidth: isMinimized ? '200px' : '0',
    overflow: 'hidden',
    transition: hasMounted ? 'opacity 0.3s ease, max-width 0.3s ease' : 'none',
    willChange: 'opacity, max-width'
  }), [isMinimized, hasMounted]);

  // Right container that holds both the white container and map overlay
  const rightContainerStyle = useMemo(() => ({
    width: 'calc((100% - 24px) / 2)',
    height: '100%',
    position: 'relative'
  }), []);

  // White container underneath the map
  const whiteUnderContainerStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '16px',
    boxSizing: 'border-box'
  }), []);

  // Map container - properly sized to cover full parent content area when fullscreen
  const mapContainerStyle = useMemo(() => ({
    position: 'absolute',
    top: isMapFullscreen ? '0' : '0',
    right: isMapFullscreen ? '0' : '0',
    bottom: isMapFullscreen ? '0' : '0',
    // When fullscreen: width = 2x child containers + gap = full parent content width
    width: isMapFullscreen ? 'calc(200% + 24px)' : '100%',
    // When fullscreen: move left by (right container width + gap)
    left: isMapFullscreen ? 'calc(-100% - 24px)' : '0',
    borderRadius: isMapFullscreen ? '16px' : '16px',
    overflow: 'hidden',
    transition: 'all 0.5s ease-in-out',
    zIndex: isMapFullscreen ? 30 : 1
  }), [isMapFullscreen]);

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      {/* Import Nura Black font */}
      <style>
        {`
          @import url('https://fonts.cdnfonts.com/css/nura-black');
        `}
      </style>

      {/* Sidebar button - OUTSIDE rounded rectangle, top left */}
      <button 
        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        className="absolute z-20" 
        style={{ 
          top: '1.2vh', 
          left: '1.2vw',
          width: '44px',
          height: '44px',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <PanelLeft color="white" size={28} strokeWidth={2} />
      </button>

      {/* Left Sidebar - OUTSIDE rounded rectangle */}
      <div style={{
        position: 'absolute',
        top: '1.2vh',
        left: leftSidebarOpen ? '1.2vw' : '-320px',
        width: '320px',
        height: 'calc(100vh - 1.2vh - 1.2vh)',
        backgroundColor: 'white',
        boxShadow: leftSidebarOpen ? '4px 0 12px rgba(0,0,0,0.15)' : 'none',
        zIndex: 15,
        transition: 'left 0.3s ease',
        borderRadius: '12px',
        overflowY: 'auto'
      }}>
        {/* Blank sidebar content */}
      </div>
      
      {/* Network status - top right */}
      <div className="absolute z-20" style={{ top: '1.2vh', right: '1.2vw' }}>
        <NetworkStatus />
      </div>

      {/* PATHFINDER Title - aligned with icons */}
      <div style={{
        position: 'absolute',
        top: '1.2vh',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        fontFamily: '"Nura Black", sans-serif',
        fontSize: '36px',
        fontWeight: 900,
        letterSpacing: '3px',
        color: '#1e40af'
      }}>
        PATHFINDER
      </div>
      
      {/* Centered container for FloatingCard */}
      <div className="w-full h-full flex items-center justify-center" style={{ paddingTop: '4vh' }}>
        <div style={containerStyle}>
          {/* Left container with ChatBot in black background */}
          <div style={leftContainerStyle}>
            <div style={leftContentStyle}>
              <ChatBot />
            </div>
            
            {/* Overlay for grey card with TravellerInformation */}
            <div ref={containerRef} style={overlayContainerStyle}>
              {/* Grey card that shrinks following button path */}
              <div style={whiteCardTransformStyle}>
                {/* Grey card background */}
                <div style={whiteCardBackgroundStyle}>
                  {selectedDates ? (
                    // Show mini cards when dates are selected
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '20px',
                      boxSizing: 'border-box',
                      gap: '16px',
                      overflow: 'auto'
                    }}>
                      <h3 style={{
                        margin: 0,
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        Your Trip
                      </h3>

                      {/* Calendar Card */}
                      <div style={{
                        backgroundColor: '#1f2937',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <Calendar color="#84cc16" size={24} strokeWidth={2} />
                        <div style={{ color: 'white' }}>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Dates</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>
                            {new Date(selectedDates.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(selectedDates.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      {/* Budget Card */}
                      <div style={{
                        backgroundColor: '#1f2937',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <DollarSign color="#84cc16" size={24} strokeWidth={2} />
                        <div style={{ color: 'white' }}>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Budget</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>
                            ₱{selectedDates.budget?.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Interests Card */}
                      <div style={{
                        backgroundColor: '#1f2937',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}>
                        <Heart color="#84cc16" size={24} strokeWidth={2} style={{ flexShrink: 0 }} />
                        <div style={{ color: 'white', flex: 1 }}>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Interests</div>
                          <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                            {selectedDates.preferences ? (
                              Object.entries(selectedDates.preferences)
                                .filter(([_, isSelected]) => isSelected)
                                .map(([pref, _]) => pref.charAt(0).toUpperCase() + pref.slice(1))
                                .join(', ') || 'None selected'
                            ) : (
                              'None selected'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Show TravellerInformation when no dates selected
                    <TravellerInformation onGetStarted={handleGetStarted} />
                  )}
                </div>
              </div>

              {/* Green button with icon transition and text */}
              <div onClick={toggleMinimize} style={buttonStyle}>
                {/* Icon container with crossfade animation */}
                <div style={iconContainerStyle}>
                  {/* Calendar icon - visible when minimized */}
                  <div style={calendarIconStyle}>
                    <Calendar 
                      color="black" 
                      size={20} 
                      strokeWidth={3}
                    />
                  </div>
                  {/* Chevron icon - visible when expanded */}
                  <div style={chevronIconStyle}>
                    <ChevronDown 
                      color="black" 
                      size={20} 
                      strokeWidth={3}
                    />
                  </div>
                </div>
                <span style={textStyle}>Preferences</span>
              </div>

              {/* Edit button - only show when expanded and dates selected */}
              {!isMinimized && selectedDates && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditMode(true);
                    setIsMinimized(false);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '52px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#84cc16',
                    border: 'none',
                    color: 'black',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  title="Edit preferences"
                >
                  <Edit2 color="black" size={18} strokeWidth={2.5} />
                </button>
              )}

              {/* Edit Modal */}
              {isEditMode && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                  }}
                  onClick={() => setIsEditMode(false)}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '90%',
                      maxWidth: '600px',
                      height: '90vh',
                      maxHeight: '600px',
                      backgroundColor: '#1f2937',
                      borderRadius: '16px',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                      animation: 'modalSlideIn 0.3s ease-out'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setIsEditMode(false)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#374151',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1001,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4b5563';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#374151';
                      }}
                    >
                      ✕
                    </button>
                    <TravellerInformation
                      onCreateItinerary={(dateData) => {
                        setIsEditMode(false);
                        setSelectedDates(dateData);
                      }}
                    />
                  </div>
                </div>
              )}

              <style>
                {`
                  @keyframes modalSlideIn {
                    from {
                      opacity: 0;
                      transform: scale(0.95);
                    }
                    to {
                      opacity: 1;
                      transform: scale(1);
                    }
                  }
                `}
              </style>
            </div>
          </div>
          
          {/* Right container with white background underneath map */}
          <div style={rightContainerStyle}>
            {/* White container underneath */}
            <div style={whiteUnderContainerStyle}>
              {/* Your content goes here */}
            </div>
            
            {/* Map container - covers full parent width when fullscreen */}
            <div style={mapContainerStyle}>
              <MapView 
                isFullscreen={isMapFullscreen}
                onToggleFullscreen={toggleMapFullscreen}
                selectedDates={selectedDates}
                onGetStarted={handleGetStarted}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

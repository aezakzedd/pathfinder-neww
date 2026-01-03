import { useEffect, useRef, useCallback, memo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize, Minimize, Map as MapIcon, List, X } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { categoryColors, categoryIcons, toSentenceCase } from '../data/selectedTouristSpots';
import { getSpotMedia } from '../hooks/useSpotMedia';
import { debounce } from '../utils/debounce';
import PlaceDetailsSidebar from './PlaceDetailsSidebar';
import ItineraryView from './ItineraryView';

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
const DEFAULT_ZOOM = 9;
const SIDEBAR_WIDTH = 480;

// Zoom-based marker visibility thresholds
const ZOOM_THRESHOLDS = {
  MIN_ZOOM_1_MARKER: 8.5,   // Below this: show 1 iOS-style marker per cluster
  MIN_ZOOM_2_MARKERS: 10,   // Between 8.5-10: show 2 markers
  MIN_ZOOM_3_MARKERS: 11    // Above 11: show 3 markers
};

// Proximity thresholds (in km) for clustering at different zoom levels
const PROXIMITY_THRESHOLDS = {
  ZOOM_LESS_8: 5,    // At zoom < 8: cluster if within 5km
  ZOOM_8_TO_9: 3,    // At zoom 8-9: cluster if within 3km
  ZOOM_9_TO_10: 2,   // At zoom 9-10: cluster if within 2km
  ZOOM_ABOVE_10: 0   // At zoom > 10: no clustering
};

// Municipality GeoJSON files mapping
const MUNICIPALITY_FILES = {
  'BARAS': 'baras.geojson',
  'BATO': 'BATO.geojson',
  'VIRAC': 'VIRAC.geojson',
  'SAN_ANDRES': 'san_andres.geojson',
  'SAN_MIGUEL': 'san_miguel.geojson',
  'BAGAMANOC': 'bagamanoc.geojson',
  'PANGANIBAN': 'panganiban.geojson',
  'VIGA': 'viga.geojson',
  'GIGMOTO': 'gigmoto.geojson',
  'PANDAN': 'pandan.geojson',
  'CARAMORAN': 'caramoran.geojson'
};

// Platform configuration
const PLATFORMS = {
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    textColor: '#FFFFFF'
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    textColor: '#FFFFFF'
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    textColor: '#FFFFFF'
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    textColor: '#FFFFFF'
  }
};

// Helper function to fetch route between two coordinates using OSRM
const fetchRoute = async (start, end) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry;
    }
    return null;
  } catch (error) {
    console.error('Route fetch error:', error);
    return null;
  }
};

// Loading Skeleton Component
const VideoSkeleton = () => (
  <div
    style={{
      width: '267px',
      height: '476px',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        animation: 'shimmer 2s infinite'
      }}
    />
    <div
      style={{
        width: '48px',
        height: '48px',
        border: '4px solid rgba(255,255,255,0.1)',
        borderTopColor: '#1e40af',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
    <style>
      {`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

// Performance Monitor Component
const PerformanceMonitor = ({ show }) => {
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    if (!show) return;

    const measureFPS = () => {
      frameCount.current++;
      const now = performance.now();
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastTime.current = now;

        if (performance.memory) {
          const usedMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
          setMemory(usedMB);
        }
      }

      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafId);
  }, [show]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#1e40af',
        padding: '12px 16px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 10002,
        minWidth: '150px',
        border: '1px solid rgba(30, 64, 175, 0.3)'
      }}
    >
      <div style={{ marginBottom: '4px', fontWeight: 'bold', color: 'white' }}>Performance</div>
      <div>FPS: <span style={{ color: fps < 30 ? '#ef4444' : fps < 50 ? '#f59e0b' : '#1e40af' }}>{fps}</span></div>
      {memory > 0 && <div>Memory: {memory} MB</div>}
    </div>
  );
};

const MapView = memo(function MapView({ isFullscreen = false, onToggleFullscreen, selectedDates, onGetStarted }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const mapLoaded = useRef(false);
  const markersRef = useRef([]);
  const markerElementsRef = useRef(new Map());
  const visibleMarkersRef = useRef(new Set());
  const popupRef = useRef(null);
  const savedState = useRef({ center: [124.2, 13.8], zoom: DEFAULT_ZOOM });
  const resizeTimeout = useRef(null);
  const animationTimeout = useRef(null);
  const previousZoom = useRef(DEFAULT_ZOOM);
  const [activeView, setActiveView] = useState('map');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [touristSpots, setTouristSpots] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const itineraryRef = useRef([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);
  const [currentMunicipality, setCurrentMunicipality] = useState(null);
  const municipalityBoundariesRef = useRef(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [modalSpot, setModalSpot] = useState(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPlace, setSidebarPlace] = useState(null);

  // Video optimization states
  const [loadedVideos, setLoadedVideos] = useState(new Set([0]));
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef([]);
  const iframeRefs = useRef([]);
  const observerRef = useRef(null);

  // Performance monitoring
  const [showPerformance, setShowPerformance] = useState(false);

  // Debug selectedDates updates
  useEffect(() => {
    console.log('MapView received selectedDates:', selectedDates);
    // Auto-switch to itinerary view when dates are selected
    if (selectedDates && selectedDates.startDate && selectedDates.endDate) {
      setActiveView('itinerary');
    }
  }, [selectedDates]);

  // Keep itinerary ref in sync
  useEffect(() => {
    itineraryRef.current = itinerary;
  }, [itinerary]);

  // Toggle performance monitor with Ctrl+Shift+P
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setShowPerformance(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Load Catanduanes municipality boundaries
  useEffect(() => {
    const loadMunicipalityBoundaries = async () => {
      try {
        const response = await fetch('/data/catanduanes.geojson');
        if (response.ok) {
          const data = await response.json();
          municipalityBoundariesRef.current = data;
          console.log('✅ Municipality boundaries loaded:', data.features.length, 'municipalities');
        }
      } catch (error) {
        console.error('Error loading municipality boundaries:', error);
      }
    };

    loadMunicipalityBoundaries();
  }, []);

  // Function to determine which municipality a point is in
  const getMunicipalityAtPoint = useCallback((lng, lat) => {
    if (!municipalityBoundariesRef.current) return null;

    const point = [lng, lat];
    
    for (const feature of municipalityBoundariesRef.current.features) {
      if (feature.geometry.type === 'Polygon') {
        if (isPointInPolygon(point, feature.geometry.coordinates[0])) {
          return feature.properties.MUNICIPALI;
        }
      }
    }
    return null;
  }, []);

  // Point-in-polygon algorithm
  const isPointInPolygon = (point, polygon) => {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }

    return inside;
  };

  // Draw routing lines
  const drawRoutes = useCallback(async () => {
    if (!map.current || !mapLoaded.current) return;

    const currentItinerary = itineraryRef.current;

    if (map.current.getSource('route')) {
      if (map.current.getLayer('route-line')) map.current.removeLayer('route-line');
      if (map.current.getLayer('route-outline')) map.current.removeLayer('route-outline');
      map.current.removeSource('route');
    }

    if (currentItinerary.length < 2) return;

    const routeSegments = [];
    for (let i = 0; i < currentItinerary.length - 1; i++) {
      const start = currentItinerary[i].coordinates;
      const end = currentItinerary[i + 1].coordinates;
      const route = await fetchRoute(start, end);
      if (route) routeSegments.push(route);
    }

    if (routeSegments.length === 0) return;

    const combinedGeometry = {
      type: 'FeatureCollection',
      features: routeSegments.map(geometry => ({ type: 'Feature', geometry }))
    };

    map.current.addSource('route', {
      type: 'geojson',
      data: combinedGeometry
    });

    map.current.addLayer({
      id: 'route-outline',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 6, 'line-opacity': 0.8 }
    });

    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#1e40af', 'line-width': 4, 'line-opacity': 0.9 }
    });
  }, []);

  useEffect(() => {
    drawRoutes();
  }, [itinerary.length, drawRoutes]);

  // Video queue system
  const updateVideoQueue = useCallback((centerIndex) => {
    const videoCount = 3;
    const newQueue = new Set();
    newQueue.add(centerIndex);
    if (centerIndex > 0) newQueue.add(centerIndex - 1);
    if (centerIndex < videoCount - 1) newQueue.add(centerIndex + 1);
    setLoadedVideos(newQueue);
    setCurrentVideoIndex(centerIndex);
  }, []);

  // Intersection Observer for video lazy loading
  useEffect(() => {
    if (!modalOpen) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.dataset.videoIndex);
          const iframe = iframeRefs.current[index];
          
          if (entry.isIntersecting) {
            updateVideoQueue(index);
            if (iframe) {
              const platform = getVideoPlatform(index);
              if (platform === 'youtube') {
                iframe.contentWindow?.postMessage(
                  JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*'
                );
              }
            }
          } else if (iframe) {
            const platform = getVideoPlatform(index);
            if (platform === 'youtube') {
              iframe.contentWindow?.postMessage(
                JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*'
              );
            }
          }
        });
      },
      { root: null, threshold: 0.5, rootMargin: '0px' }
    );

    videoRefs.current.forEach((ref) => {
      if (ref) observerRef.current.observe(ref);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [modalOpen, updateVideoQueue]);

  // Load ALL tourist spots data from all municipalities
  useEffect(() => {
    const loadAllTouristSpots = async () => {
      const spots = [];
      let spotIndex = 0;
      
      console.log('🔄 Loading tourist spots from all 11 municipalities...');
      
      // Loop through all 11 municipalities
      for (const [municipality, geojsonFile] of Object.entries(MUNICIPALITY_FILES)) {
        try {
          const response = await fetch(`/data/${geojsonFile}`);
          if (!response.ok) {
            console.warn(`⚠️ Could not load ${geojsonFile}`);
            continue;
          }
          
          const geojson = await response.json();
          
          // Load ALL features from this municipality
          for (const feature of geojson.features) {
            const mediaData = await getSpotMedia(
              feature.properties.municipality || municipality,
              feature.properties.name
            );
            
            spots.push({
              name: feature.properties.name,
              location: toSentenceCase(feature.properties.municipality || municipality),
              municipality: municipality,
              coordinates: feature.geometry.coordinates,
              description: feature.properties.description,
              categories: feature.properties.categories || [],
              images: mediaData.images || [],
              spotIndex: spotIndex++,
              isPopular: false
            });
          }
          
          console.log(`✅ Loaded ${geojson.features.length} spots from ${municipality}`);
        } catch (error) {
          console.error(`❌ Error loading ${geojsonFile}:`, error);
        }
      }
      
      console.log(`✅ Total loaded: ${spots.length} tourist spots from ${Object.keys(MUNICIPALITY_FILES).length} municipalities`);
      setTouristSpots(spots);
      setDataLoaded(true);
    };

    loadAllTouristSpots();
  }, []);

  // Handler functions
  const addToItinerary = useCallback((spot, buttonElement) => {
    const isAlreadyAdded = itineraryRef.current.some(item => item.name === spot.name);
    
    if (!isAlreadyAdded) {
      if (buttonElement) {
        buttonElement.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        buttonElement.style.backgroundColor = '#22c55e';
        buttonElement.style.pointerEvents = 'none';
      }
      setItinerary(prev => [...prev, spot]);
    }
  }, []);

  const removeFromItinerary = useCallback((index) => {
    setItinerary(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCardClick = useCallback((place) => {
    const imageUrl = place.images && place.images.length > 0 ? place.images[0] : null;
    setModalImage(imageUrl);
    setModalSpot(place);
    setModalOpen(true);
    setSidebarPlace(place);
    setSidebarOpen(true);
    setLoadedVideos(new Set([0]));
  }, []);

  const handleImageClick = useCallback((image, spot) => {
    setModalImage(image);
    setModalSpot(spot);
    setModalOpen(true);
    setSidebarPlace(spot);
    setSidebarOpen(true);
    setLoadedVideos(new Set([0]));
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSidebarOpen(false);
    iframeRefs.current.forEach((iframe, index) => {
      if (iframe) {
        const platform = getVideoPlatform(index);
        if (platform === 'youtube') {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*'
          );
        }
      }
    });
    setTimeout(() => {
      setModalImage(null);
      setModalSpot(null);
      setSidebarPlace(null);
      setLoadedVideos(new Set([0]));
    }, 300);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    setTimeout(() => setSidebarPlace(null), 300);
  }, []);

  // Marker utility functions
  const getMarkerScale = (zoom) => {
    const baseZoom = 9;
    return Math.max(0.5, 1 - (zoom - baseZoom) * 0.1);
  };

  const updateMarkerSizes = useCallback((zoom) => {
    const scale = getMarkerScale(zoom);
    markersRef.current.forEach(marker => {
      const element = marker.getElement();
      const icon = element?.querySelector('i');
      if (icon) icon.style.fontSize = `${42 * scale}px`;
    });
  }, []);

  const getCategoryPill = useCallback((category) => {
    const colors = categoryColors[category] || categoryColors.default;
    return `
      <span style="
        display: inline-block;
        padding: 4px 10px;
        border-radius: 12px;
        background-color: ${colors.bg};
        color: ${colors.text};
        font-size: 10px;
        font-weight: 600;
        text-transform: capitalize;
        margin-right: 4px;
        margin-bottom: 4px;
      ">${category.toLowerCase().replace('_', ' ')}</span>
    `;
  }, []);

  const isSpotInItinerary = useCallback((spotName) => {
    return itineraryRef.current.some(item => item.name === spotName);
  }, []);

  const createInfoCardHTML = useCallback((spot) => {
    const categoryHTML = spot.categories.slice(0, 2).map(cat => getCategoryPill(cat)).join('');
    const isInItinerary = isSpotInItinerary(spot.name);
    const hasImages = spot.images && spot.images.length > 0;
    const imageCount = spot.images ? spot.images.length : 0;
    
    const buttonsHTML = `
      <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 6px; z-index: 20;">
        <button id="add-to-itinerary-btn" style="
          width: 28px; height: 28px; min-width: 28px; flex-shrink: 0; border-radius: 14px;
          background-color: ${isInItinerary ? '#22c55e' : 'rgba(30, 64, 175, 0.95)'};
          border: none; display: flex; align-items: center; justify-content: center;
          cursor: ${isInItinerary ? 'default' : 'pointer'};
          pointer-events: ${isInItinerary ? 'none' : 'auto'}; padding: 0;
        ">
          ${isInItinerary ? `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ` : `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          `}
        </button>
        <button id="close-card-btn" style="
          width: 28px; height: 28px; min-width: 28px; flex-shrink: 0; border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.6); border: none;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    
    const stepIndicatorsHTML = imageCount > 1 ? `
      <div id="step-indicators" style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 15;">
        ${Array.from({ length: imageCount }, (_, i) => `
          <div class="step-indicator" data-step="${i}" style="
            width: 6px; height: 6px; border-radius: 50%;
            background-color: ${i === 0 ? 'white' : 'rgba(255, 255, 255, 0.5)'};
            transition: background-color 0.3s ease;
          "></div>
        `).join('')}
      </div>
    ` : '';
    
    const carouselHTML = hasImages ? `
      <div id="carousel-container" style="width: 100%; height: 210px; background-color: #e5e7eb; position: relative; overflow: hidden; border-radius: 12px 12px 0 0;">
        ${buttonsHTML}
        ${stepIndicatorsHTML}
        ${spot.images.map((img, idx) => `
          <img src="${img}" alt="${spot.name}" class="carousel-image" data-index="${idx}" data-image-url="${img}"
            style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;
                   opacity: ${idx === 0 ? '1' : '0'}; transition: opacity 0.3s ease; cursor: pointer;" />
        `).join('')}
        ${spot.images.length > 1 ? `
          <button id="carousel-prev-btn" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; background-color: rgba(0, 0, 0, 0.5); border: none; cursor: pointer; z-index: 10;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button id="carousel-next-btn" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; background-color: rgba(0, 0, 0, 0.5); border: none; cursor: pointer; z-index: 10;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        ` : ''}
      </div>
    ` : `
      <div style="width: 100%; height: 210px; background-color: #e5e7eb; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; border-radius: 12px 12px 0 0;">
        ${buttonsHTML}
        <i class="fa-solid fa-location-dot" style="font-size: 48px; color: #9ca3af;"></i>
      </div>
    `;

    return `
      <div class="info-card-popup" style="width: 280px; background-color: white; border-radius: 12px; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12); overflow: visible; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; transform: scale(0.3); opacity: 0; transform-origin: bottom center; transition: transform 0.3s ease-out, opacity 0.3s ease-out; position: relative;">
        ${carouselHTML}
        <div style="width: 100%; height: 1px; background-color: #000000; position: relative;"></div>
        <button id="view-details-btn" style="position: absolute; top: 205px; left: 50%; transform: translateX(-50%); padding: 6px 16px; background-color: #000000; color: white; border: none; border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; z-index: 25; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); white-space: nowrap; display: flex; align-items: center; gap: 6px; transition: transform 0.2s ease, box-shadow 0.2s ease;"
          onmouseover="this.style.transform='translateX(-50%) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.4)'"
          onmouseout="this.style.transform='translateX(-50%) scale(1)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.3)'">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          View Details
        </button>
        <div style="padding: 20px 14px 12px 14px; box-sizing: border-box; width: 100%; max-width: 280px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <i class="fa-solid fa-location-dot" style="font-size: 12px; color: #6b7280; flex-shrink: 0;"></i>
            <span style="color: #6b7280; font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${spot.location}</span>
          </div>
          <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #111827; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word; hyphens: auto; width: 100%; box-sizing: border-box;">${spot.name}</h3>
          <div style="display: flex; flex-wrap: wrap;">
            ${categoryHTML}
          </div>
        </div>
      </div>
    `;
  }, [getCategoryPill, isSpotInItinerary]);

  // Get category icon
  const getCategoryIcon = useCallback((categories) => {
    if (!categories || categories.length === 0) return categoryIcons.default;
    return categoryIcons[categories[0]] || categoryIcons.default;
  }, []);

  // Create marker element with zoom-based styling
  const createMarkerElement = useCallback((spot, zoom, useIOSStyle = false) => {
    const markerEl = document.createElement('div');
    
    // Show iOS-style marker for Binurong Point at any zoom, or for other spots only at far zoom
    const isBinurong = spot.name === 'Binurong Point';
    const shouldUseIOSStyle = (useIOSStyle || isBinurong) && spot.images && spot.images.length > 0;
    
    if (shouldUseIOSStyle) {
      // iOS-style image marker for far zoom levels
      markerEl.style.display = 'flex';
      markerEl.style.flexDirection = 'column';
      markerEl.style.alignItems = 'center';
      markerEl.style.gap = '4px';
      
      markerEl.innerHTML = `
        <div class="ios-marker-container" style="position: relative; cursor: pointer;">
          <div class="ios-marker-image" style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 3px solid white; background-color: #e5e7eb; transition: all 0.2s ease;">
            <img src="${spot.images[0]}" alt="${spot.name}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        </div>
        <span class="marker-text" style="font-size: 13px; font-weight: 700; color: #000000; white-space: nowrap; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${spot.name}</span>
      `;
      
      const imageContainer = markerEl.querySelector('.ios-marker-image');
      markerEl.addEventListener('mouseenter', () => {
        imageContainer.style.transform = 'scale(1.1)';
        imageContainer.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
      });
      markerEl.addEventListener('mouseleave', () => {
        imageContainer.style.transform = 'scale(1)';
        imageContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      });
    } else {
      // Simple circle marker for closer zoom levels
      markerEl.style.display = 'flex';
      markerEl.style.alignItems = 'center';
      markerEl.style.gap = '6px';
      
      const icon = getCategoryIcon(spot.categories);
      
      markerEl.innerHTML = `
        <div class="simple-marker-circle" style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.2); cursor: pointer; transition: all 0.2s ease;">
          <i class="fa-solid ${icon}" style="font-size: 12px; color: white;"></i>
        </div>
        <span class="marker-text" style="font-size: 12px; font-weight: 600; color: #000000; white-space: nowrap; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, -1.5px 0 0 #fff, 1.5px 0 0 #fff, 0 -1.5px 0 #fff, 0 1.5px 0 #fff;">${spot.name}</span>
      `;
      
      const circle = markerEl.querySelector('.simple-marker-circle');
      markerEl.addEventListener('mouseenter', () => {
        circle.style.transform = 'scale(1.1)';
        circle.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
      });
      markerEl.addEventListener('mouseleave', () => {
        circle.style.transform = 'scale(1)';
        circle.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      });
    }
    
    return markerEl;
  }, [getCategoryIcon]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lng1, lat1, lng2, lat2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get proximity threshold based on zoom level
  const getProximityThreshold = (zoom) => {
    if (zoom < 8) return PROXIMITY_THRESHOLDS.ZOOM_LESS_8;
    if (zoom < 9) return PROXIMITY_THRESHOLDS.ZOOM_8_TO_9;
    if (zoom < 10) return PROXIMITY_THRESHOLDS.ZOOM_9_TO_10;
    return PROXIMITY_THRESHOLDS.ZOOM_ABOVE_10; // No clustering at high zoom
  };

  // Cluster nearby spots and return only representative spots
  const clusterNearbySpots = (spots, proximityThreshold) => {
    if (proximityThreshold === 0) return spots; // No clustering needed
    
    const clustered = [];
    const used = new Set();
    
    spots.forEach((spot, index) => {
      if (used.has(index)) return;
      
      // This spot becomes the cluster representative
      clustered.push(spot);
      used.add(index);
      
      // Mark all nearby spots as used (they're in this cluster)
      spots.forEach((otherSpot, otherIndex) => {
        if (index === otherIndex || used.has(otherIndex)) return;
        
        const distance = calculateDistance(
          spot.coordinates[0],
          spot.coordinates[1],
          otherSpot.coordinates[0],
          otherSpot.coordinates[1]
        );
        
        if (distance <= proximityThreshold) {
          used.add(otherIndex);
        }
      });
    });
    
    return clustered;
  };

  // Determine max markers based on zoom level
  const getMaxMarkersForZoom = (zoom) => {
    if (zoom < ZOOM_THRESHOLDS.MIN_ZOOM_1_MARKER) return 1;
    if (zoom < ZOOM_THRESHOLDS.MIN_ZOOM_2_MARKERS) return 2;
    return 3;
  };

  // Update visible markers with zoom-based progressive filtering AND proximity clustering
  const updateVisibleMarkers = useCallback(() => {
    if (!map.current || !mapLoaded.current || touristSpots.length === 0) return;

    const zoom = map.current.getZoom();
    const center = map.current.getCenter();
    const viewCenter = [center.lng, center.lat];
    
    setCurrentZoom(zoom);
    
    // Get current municipality
    const currentMuni = getMunicipalityAtPoint(viewCenter[0], viewCenter[1]);
    setCurrentMunicipality(currentMuni);
    
    // Determine proximity threshold for this zoom level
    const proximityThreshold = getProximityThreshold(zoom);
    
    // Determine how many markers to show based on zoom
    const maxMarkers = getMaxMarkersForZoom(zoom);
    const useIOSStyle = zoom < ZOOM_THRESHOLDS.MIN_ZOOM_1_MARKER;
    
    const currentVisibleSpots = new Set();
    
    // Calculate distance from camera center to each spot
    const spotsWithDistance = touristSpots.map(spot => ({
      ...spot,
      distance: calculateDistance(
        viewCenter[0],
        viewCenter[1],
        spot.coordinates[0],
        spot.coordinates[1]
      )
    }));
    
    // Sort by distance from camera (closest first)
    spotsWithDistance.sort((a, b) => a.distance - b.distance);
    
    // Apply proximity clustering to prevent overlaps
    const clusteredSpots = clusterNearbySpots(spotsWithDistance, proximityThreshold);
    
    // Take the appropriate number of markers based on zoom
    let spotsToShow = clusteredSpots.slice(0, maxMarkers);
    
    // ALWAYS include Binurong Point - find it in the original touristSpots array
    const binurong = touristSpots.find(spot => spot.name === 'Binurong Point');
    if (binurong && !spotsToShow.find(s => s.name === 'Binurong Point')) {
      // Replace the last spot with Binurong Point if not already included
      spotsToShow = [binurong, ...spotsToShow.slice(0, -1)];
    }
    
    spotsToShow.forEach((spot) => {
      const isCurrentlyVisible = visibleMarkersRef.current.has(spot.name);
      
      if (!isCurrentlyVisible) {
        // Add marker
        currentVisibleSpots.add(spot.name);
        // Always use iOS style for Binurong Point, otherwise use based on zoom
        const isBinurong = spot.name === 'Binurong Point';
        const markerIOSStyle = isBinurong || useIOSStyle;
        const markerEl = createMarkerElement(spot, zoom, markerIOSStyle);
        markerElementsRef.current.set(spot.name, markerEl);

        const marker = new maplibregl.Marker({ 
          element: markerEl, 
          anchor: 'center'
        })
          .setLngLat(spot.coordinates)
          .addTo(map.current);

        // Click handler
        markerEl.addEventListener('click', () => {
          setSelectedSpot(spot);
          
          markerEl.style.opacity = '0';
          
          if (popupRef.current) popupRef.current.remove();

          const popup = new maplibregl.Popup({
            offset: [0, -342],
            closeButton: false,
            closeOnClick: false,
            maxWidth: 'none'
          })
            .setLngLat(spot.coordinates)
            .setHTML(createInfoCardHTML(spot))
            .addTo(map.current);

          popupRef.current = popup;

          setTimeout(() => {
            const popupCard = document.querySelector('.info-card-popup');
            if (popupCard) {
              popupCard.style.transform = 'scale(1)';
              popupCard.style.opacity = '1';
            }

            let currentIdx = 0;
            const images = document.querySelectorAll('.carousel-image');
            const stepIndicators = document.querySelectorAll('.step-indicator');

            function showImage(index) {
              images.forEach((img, i) => img.style.opacity = i === index ? '1' : '0');
              stepIndicators.forEach((indicator, i) => {
                indicator.style.backgroundColor = i === index ? 'white' : 'rgba(255, 255, 255, 0.5)';
              });
            }

            images.forEach((img) => {
              img.addEventListener('click', (e) => {
                handleImageClick(e.target.getAttribute('data-image-url'), spot);
              });
            });

            const prevBtn = document.getElementById('carousel-prev-btn');
            const nextBtn = document.getElementById('carousel-next-btn');
            
            if (prevBtn) {
              prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIdx = (currentIdx - 1 + images.length) % images.length;
                showImage(currentIdx);
              });
            }

            if (nextBtn) {
              nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIdx = (currentIdx + 1) % images.length;
                showImage(currentIdx);
              });
            }

            const closeBtn = document.getElementById('close-card-btn');
            if (closeBtn) {
              closeBtn.addEventListener('click', () => {
                if (popupRef.current) {
                  popupRef.current.remove();
                  popupRef.current = null;
                }
                
                const currentMarkerEl = markerElementsRef.current.get(spot.name);
                if (currentMarkerEl) {
                  currentMarkerEl.style.opacity = '1';
                }
                setSelectedSpot(null);
              });
            }

            const addBtn = document.getElementById('add-to-itinerary-btn');
            if (addBtn && !isSpotInItinerary(spot.name)) {
              addBtn.addEventListener('click', () => addToItinerary(spot, addBtn));
            }

            const viewDetailsBtn = document.getElementById('view-details-btn');
            if (viewDetailsBtn) {
              viewDetailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleImageClick(spot.images[0], spot);
              });
            }
          }, 0);
          
          map.current.flyTo({
            center: spot.coordinates,
            zoom: Math.max(map.current.getZoom(), 12),
            padding: { top: 300, bottom: 50, left: 0, right: 0 },
            duration: 800
          });
        });

        markersRef.current.push(marker);
      } else {
        currentVisibleSpots.add(spot.name);
      }
    });
    
    // Remove markers that should no longer be visible
    const markersToRemove = [];
    visibleMarkersRef.current.forEach(spotName => {
      if (!currentVisibleSpots.has(spotName)) {
        markersToRemove.push(spotName);
      }
    });
    
    markersToRemove.forEach(spotName => {
      const markerIndex = markersRef.current.findIndex(m => {
        const spot = touristSpots.find(s => s.name === spotName);
        return spot && m.getLngLat().lng === spot.coordinates[0] && m.getLngLat().lat === spot.coordinates[1];
      });
      
      if (markerIndex !== -1) {
        markersRef.current[markerIndex].remove();
        markersRef.current.splice(markerIndex, 1);
        markerElementsRef.current.delete(spotName);
      }
    });
    
    visibleMarkersRef.current = currentVisibleSpots;
    
    const clusterInfo = proximityThreshold > 0 ? ` | Clustered within ${proximityThreshold}km` : '';
    console.log(`📍 Showing ${currentVisibleSpots.size}/${maxMarkers} markers (zoom: ${zoom.toFixed(1)}) | ${useIOSStyle ? 'iOS style' : 'Simple style'}${clusterInfo} | ${currentMuni || 'Unknown'}`);
  }, [touristSpots, createMarkerElement, createInfoCardHTML, handleImageClick, addToItinerary, isSpotInItinerary, getMunicipalityAtPoint]);

  // Create debounced version of updateVisibleMarkers
  const debouncedUpdateMarkers = useCallback(
    debounce(() => updateVisibleMarkers(), 150),
    [updateVisibleMarkers]
  );

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);

    const bounds = [[123.5, 12.8], [125.0, 14.8]];

    fetch(`https://api.maptiler.com/maps/toner-v2/style.json?key=${MAPTILER_API_KEY}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to load map style`);
        }
        return response.json();
      })
      .then(style => {
        // Remove all text/label layers
        style.layers = style.layers.filter(layer => layer.type !== 'symbol');
        
        // Remove problematic glyphs URL
        if (style.glyphs) {
          delete style.glyphs;
        }

        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: style,
          center: [124.2, 13.8],
          zoom: DEFAULT_ZOOM,
          pitch: 0,
          bearing: 0,
          attributionControl: false,
          maxBounds: bounds,
          
          // RPI Performance Settings with 3D enabled
          antialias: false,
          fadeDuration: 0,
          localIdeographFontFamily: false,
          preserveDrawingBuffer: false,
          refreshExpiredTiles: false,
          maxTileCacheSize: 50,
          optimizeForTerrain: false,
          pitchWithRotate: true,
          touchPitch: true,
          maxPitch: 85,
          minPitch: 0
        });

        // Add navigation controls with 3D support
        map.current.addControl(
          new maplibregl.NavigationControl({
            visualizePitch: true,
            showCompass: true,
            showZoom: true
          }),
          'top-right'
        );

        // Add scale control at bottom right with black/white theme
        const scaleControl = new maplibregl.ScaleControl({
          maxWidth: 100,
          unit: 'metric'
        });
        map.current.addControl(scaleControl, 'bottom-right');

        map.current.on('zoom', () => updateMarkerSizes(map.current.getZoom()));
        map.current.on('moveend', debouncedUpdateMarkers);
        map.current.on('zoomend', debouncedUpdateMarkers);

        map.current.on('load', () => {
          mapLoaded.current = true;
          
          // Add sky layer for proper 3D pitch rendering
          map.current.setSky({
            'sky-color': '#000000',
            'sky-horizon-blend': 0.3,
            'horizon-color': '#000000',
            'horizon-fog-blend': 0.3,
            'fog-color': '#000000',
            'fog-ground-blend': 0.2
          });
          
          if (!map.current.getSource('mask')) {
            map.current.addSource('mask', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
                    [[124.011, 13.35], [124.011, 14.15], [124.45, 14.15], [124.45, 13.35], [124.011, 13.35]]
                  ]
                }
              }
            });

            map.current.addLayer({
              id: 'mask-layer',
              type: 'fill',
              source: 'mask',
              paint: { 'fill-color': '#000000', 'fill-opacity': 1 }
            });
          }

          if (dataLoaded && touristSpots.length > 0) {
            setTimeout(() => updateVisibleMarkers(), 200);
          }
        });
      })
      .catch(error => {
        console.error('Map initialization error:', error);
      });

    return () => {
      if (popupRef.current) popupRef.current.remove();
      markersRef.current.forEach(marker => {
        marker.remove();
        marker = null;
      });
      markersRef.current = [];
      markerElementsRef.current.clear();
      visibleMarkersRef.current.clear();
      
      if (map.current) {
        map.current.off('moveend', debouncedUpdateMarkers);
        map.current.off('zoomend', debouncedUpdateMarkers);
        map.current.remove();
        map.current = null;
        mapLoaded.current = false;
      }
    };
  }, [updateMarkerSizes, debouncedUpdateMarkers, updateVisibleMarkers, dataLoaded, touristSpots]);

  useEffect(() => {
    if (mapLoaded.current && dataLoaded && touristSpots.length > 0) {
      const timer = setTimeout(() => updateVisibleMarkers(), 200);
      return () => clearTimeout(timer);
    }
  }, [dataLoaded, touristSpots, updateVisibleMarkers]);

  const handleResize = useCallback(() => {
    if (!map.current) return;
    if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    resizeTimeout.current = setTimeout(() => {
      if (map.current) {
        map.current.resize();
        map.current.jumpTo({ center: savedState.current.center, zoom: savedState.current.zoom });
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (map.current) previousZoom.current = map.current.getZoom();
    if (animationTimeout.current) clearTimeout(animationTimeout.current);
    animationTimeout.current = setTimeout(handleResize, 750);
    return () => clearTimeout(animationTimeout.current);
  }, [isFullscreen, handleResize]);

  const handleToggleFullscreen = useCallback(() => {
    if (onToggleFullscreen) onToggleFullscreen();
  }, [onToggleFullscreen]);

  const getVideoPlatform = (index) => index === 1 ? 'youtube' : 'facebook';

  const VideoCard = ({ index, isLoaded }) => {
    const platform = getVideoPlatform(index);
    const platformConfig = PLATFORMS[platform];
    const isLandscape = platform === 'youtube';

    return (
      <div ref={(el) => (videoRefs.current[index] = el)} data-video-index={index}
        style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'start' }}>
        <div style={{ width: isLandscape ? '500px' : '300px', height: '85vh', maxHeight: isLandscape ? '400px' : '600px', backgroundColor: '#000', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', overflow: 'hidden', position: 'relative' }}>
          {!isLoaded ? <VideoSkeleton /> : platform === 'youtube' ? (
            <iframe ref={(el) => (iframeRefs.current[index] = el)} width="100%" height="100%" 
              src="https://www.youtube.com/embed/j6IsY1PR5XE?enablejsapi=1&autoplay=1&mute=1" 
              frameBorder="0" allowFullScreen style={{ border: 'none', borderRadius: '16px' }} />
          ) : (
            <iframe ref={(el) => (iframeRefs.current[index] = el)}
              src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F3233230416819996%2F&show_text=false&width=267&autoplay=true" 
              width="267" height="476" frameBorder="0" allowFullScreen style={{ border: 'none', borderRadius: '8px' }} />
          )}
          {modalSpot && isLoaded && (
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                {modalSpot.location}
              </p>
              <div style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: platformConfig.color, color: platformConfig.textColor, fontSize: '12px', fontWeight: '600' }}>
                {platformConfig.name}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ModalContent = () => (
    <div onClick={closeModal} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9998, display: 'flex' }}>
      <PerformanceMonitor show={showPerformance} />
      <div onClick={(e) => e.stopPropagation()} style={{ width: sidebarOpen ? `calc(100vw - ${SIDEBAR_WIDTH}px)` : '100vw', height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }} className="video-scroll-container">
        {[0, 1, 2].map((index) => <VideoCard key={index} index={index} isLoaded={loadedVideos.has(index)} />)}
      </div>
      {sidebarOpen && <div style={{ width: `${SIDEBAR_WIDTH}px`, height: '100vh' }} />}
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {modalOpen && createPortal(<ModalContent />, document.body)}
      {createPortal(<PlaceDetailsSidebar place={sidebarPlace} isOpen={sidebarOpen} onClose={closeSidebar} onCloseModal={closeModal} />, document.body)}

      {activeView === 'map' && (
        <button onClick={handleToggleFullscreen} style={{ position: 'absolute', top: '12px', left: '12px', width: '36px', height: '36px', borderRadius: '4px', backgroundColor: 'white', border: 'none', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {isFullscreen ? <Minimize color="black" size={18} /> : <Maximize color="black" size={18} />}
        </button>
      )}

      <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, display: 'flex', backgroundColor: 'white', borderRadius: '16px', padding: '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', gap: '3px' }}>
        <button onClick={() => setActiveView('map')} style={{ padding: '6px 10px', border: 'none', borderRadius: '13px', backgroundColor: activeView === 'map' ? '#1f2937' : 'transparent', color: activeView === 'map' ? 'white' : '#6b7280', cursor: 'pointer' }}>
          <MapIcon size={16} />
        </button>
        <button onClick={() => setActiveView('itinerary')} style={{ padding: '6px 10px', border: 'none', borderRadius: '13px', backgroundColor: activeView === 'itinerary' ? '#1f2937' : 'transparent', color: activeView === 'itinerary' ? 'white' : '#6b7280', cursor: 'pointer' }}>
          <List size={16} />
        </button>
      </div>

      <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', display: activeView === 'map' ? 'block' : 'none' }} />

      {activeView === 'itinerary' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '16px', backgroundColor: 'white', overflow: 'hidden' }}>
          <ItineraryView itinerary={itinerary} onRemoveItem={removeFromItinerary} onCardClick={handleCardClick} selectedDates={selectedDates} onNavigateToMap={() => setActiveView('map')} onGetStarted={onGetStarted} />
        </div>
      )}

      <style>
        {`
          .maplibregl-popup-content { padding: 0 !important; background: transparent !important; box-shadow: none !important; }
          .maplibregl-popup-tip { display: none !important; }
          .video-scroll-container::-webkit-scrollbar { display: none; }
          
          /* Scale control black/white theme */
          .maplibregl-ctrl-scale {
            background-color: rgba(255, 255, 255, 0.95) !important;
            color: #000000 !important;
            border: 2px solid #000000 !important;
            border-top: none !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            padding: 2px 6px !important;
            margin-bottom: 8px !important;
            margin-right: 8px !important;
          }
        `}
      </style>
    </div>
  );
});

export default MapView;
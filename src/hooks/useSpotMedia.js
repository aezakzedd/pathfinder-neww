/**
 * Enhanced hook to load tourist spot media (images + videos) from media-manifest.json
 * Optimized for Raspberry Pi performance with video support
 */

import { useState, useEffect } from 'react';

const MEDIA_MANIFEST_PATH = '/assets/media-manifest.json';
let manifestCache = null;

/**
 * Load media-manifest.json (cached)
 */
export const loadMediaManifest = async () => {
  if (manifestCache) {
    return manifestCache;
  }
  
  try {
    const response = await fetch(MEDIA_MANIFEST_PATH);
    manifestCache = await response.json();
    return manifestCache;
  } catch (error) {
    console.error('Failed to load media manifest:', error);
    return { config: {}, spots: {}, statistics: {} };
  }
};

/**
 * Get full media data for a specific tourist spot
 * @param {string} municipality - Municipality name (e.g., 'BARAS')
 * @param {string} spotName - Tourist spot name (e.g., 'Binurong Point')
 * @returns {Object} { images, videos, thumbnail, featured, categories, hasVideo, mediaCount }
 */
export const getSpotMedia = async (municipality, spotName) => {
  const manifest = await loadMediaManifest();
  const spot = manifest.spots?.[municipality.toUpperCase()]?.[spotName];
  
  if (!spot) {
    return {
      images: [],
      videos: [],
      thumbnail: null,
      featured: null,
      categories: [],
      hasVideo: false,
      mediaCount: { images: 0, videos: 0, total: 0 }
    };
  }
  
  const config = manifest.config || {};
  const imagePath = config.imagePath || '/assets/images';
  const videoPath = config.videoPath || '/assets/videos';
  
  return {
    images: spot.media.images.map(img => `${imagePath}/${img}`),
    videos: spot.media.videos.map(vid => `${videoPath}/${vid}`),
    thumbnail: spot.media.thumbnail ? `${imagePath}/${spot.media.thumbnail}` : null,
    featured: spot.media.featured ? `${imagePath}/${spot.media.featured}` : null,
    categories: spot.categories || [],
    hasVideo: spot.hasVideo || false,
    mediaCount: spot.mediaCount || { images: 0, videos: 0, total: 0 }
  };
};

/**
 * React hook to load spot media (images + videos)
 * @param {string} municipality - Municipality name
 * @param {string} spotName - Tourist spot name
 */
export const useSpotMedia = (municipality, spotName) => {
  const [data, setData] = useState({
    images: [],
    videos: [],
    thumbnail: null,
    featured: null,
    categories: [],
    hasVideo: false,
    mediaCount: { images: 0, videos: 0, total: 0 },
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!municipality || !spotName) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        const mediaData = await getSpotMedia(municipality, spotName);
        
        if (isMounted) {
          setData({
            ...mediaData,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (isMounted) {
          setData(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }));
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [municipality, spotName]);

  return data;
};

/**
 * Get all spots for a municipality
 * @param {string} municipality - Municipality name
 */
export const getMunicipalitySpots = async (municipality) => {
  const manifest = await loadMediaManifest();
  return manifest.spots?.[municipality.toUpperCase()] || {};
};

/**
 * Check if a spot has any media (images or videos)
 * @param {string} municipality - Municipality name
 * @param {string} spotName - Tourist spot name
 */
export const hasMedia = async (municipality, spotName) => {
  const mediaData = await getSpotMedia(municipality, spotName);
  return mediaData.mediaCount.total > 0;
};

/**
 * Get spots that have videos
 * @param {string} municipality - Municipality name (optional)
 */
export const getSpotsWithVideos = async (municipality = null) => {
  const manifest = await loadMediaManifest();
  const spots = [];
  
  const municipalities = municipality 
    ? [municipality.toUpperCase()] 
    : Object.keys(manifest.spots || {});
  
  for (const muni of municipalities) {
    const muniSpots = manifest.spots[muni] || {};
    for (const [spotName, spotData] of Object.entries(muniSpots)) {
      if (spotData.hasVideo) {
        spots.push({
          municipality: muni,
          name: spotName,
          videoCount: spotData.mediaCount.videos
        });
      }
    }
  }
  
  return spots;
};

/**
 * Preload media (images and video thumbnails) for better performance
 * Note: Videos themselves should be lazy-loaded on demand
 * @param {string[]} imageUrls - Array of image URLs to preload
 */
export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error(`Failed to load ${url}`));
        img.src = url;
      });
    })
  );
};

/**
 * Get video with specific quality if available
 * @param {string} videoFileName - Base video filename
 * @param {string} quality - Quality level ('1080p', '720p', '480p')
 */
export const getVideoQuality = async (videoFileName, quality = '720p') => {
  const manifest = await loadMediaManifest();
  const config = manifest.config || {};
  const videoPath = config.videoPath || '/assets/videos';
  const qualitySuffix = config.videoQuality?.[quality] || '';
  
  const [name, ext] = videoFileName.split('.');
  return `${videoPath}/${name}${qualitySuffix}.${ext}`;
};

/**
 * Get manifest statistics
 */
export const getMediaStatistics = async () => {
  const manifest = await loadMediaManifest();
  return manifest.statistics || {};
};

export default useSpotMedia;

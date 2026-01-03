/**
 * Custom hook to load tourist spot images from manifest.json
 * Optimized for Raspberry Pi performance
 */

import { useState, useEffect } from 'react';

const IMAGE_BASE_PATH = '/assets/images';
let manifestCache = null;

/**
 * Load manifest.json (cached)
 */
export const loadManifest = async () => {
  if (manifestCache) {
    return manifestCache;
  }
  
  try {
    const response = await fetch(`${IMAGE_BASE_PATH}/manifest.json`);
    manifestCache = await response.json();
    return manifestCache;
  } catch (error) {
    console.error('Failed to load image manifest:', error);
    return { spots: {} };
  }
};

/**
 * Get images for a specific tourist spot
 * @param {string} municipality - Municipality name (e.g., 'BARAS')
 * @param {string} spotName - Tourist spot name (e.g., 'Binurong Point')
 * @returns {Object} { images: string[], thumbnail: string|null, categories: string[] }
 */
export const getSpotData = async (municipality, spotName) => {
  const manifest = await loadManifest();
  const spot = manifest.spots?.[municipality.toUpperCase()]?.[spotName];
  
  if (!spot) {
    return { images: [], thumbnail: null, categories: [] };
  }
  
  return {
    images: spot.images.map(img => `${IMAGE_BASE_PATH}/${img}`),
    thumbnail: spot.thumbnail ? `${IMAGE_BASE_PATH}/${spot.thumbnail}` : null,
    categories: spot.categories || []
  };
};

/**
 * React hook to load spot images
 * @param {string} municipality - Municipality name
 * @param {string} spotName - Tourist spot name
 */
export const useSpotImages = (municipality, spotName) => {
  const [data, setData] = useState({
    images: [],
    thumbnail: null,
    categories: [],
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
        const spotData = await getSpotData(municipality, spotName);
        
        if (isMounted) {
          setData({
            ...spotData,
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
  const manifest = await loadManifest();
  return manifest.spots?.[municipality.toUpperCase()] || {};
};

/**
 * Check if a spot has images
 * @param {string} municipality - Municipality name
 * @param {string} spotName - Tourist spot name
 */
export const hasImages = async (municipality, spotName) => {
  const spotData = await getSpotData(municipality, spotName);
  return spotData.images.length > 0;
};

/**
 * Preload images for better performance
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

export default useSpotImages;

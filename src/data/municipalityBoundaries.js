/**
 * Municipality boundaries for Catanduanes
 * Used to determine which municipality the user is viewing
 * Optimized for Raspberry Pi 4B performance
 */

export const municipalityBoundaries = {
  VIRAC: {
    name: 'Virac',
    bounds: {
      north: 13.62,
      south: 13.53,
      east: 124.25,
      west: 124.20
    },
    center: [124.23, 13.58]
  },
  BARAS: {
    name: 'Baras',
    bounds: {
      north: 14.05,
      south: 13.90,
      east: 124.35,
      west: 124.25
    },
    center: [124.30, 13.98]
  },
  SAN_ANDRES: {
    name: 'San Andres',
    bounds: {
      north: 13.87,
      south: 13.72,
      east: 124.18,
      west: 124.08
    },
    center: [124.13, 13.80]
  },
  BATO: {
    name: 'Bato',
    bounds: {
      north: 13.48,
      south: 13.35,
      east: 124.38,
      west: 124.28
    },
    center: [124.33, 13.42]
  },
  SAN_MIGUEL: {
    name: 'San Miguel',
    bounds: {
      north: 13.72,
      south: 13.62,
      east: 124.18,
      west: 124.08
    },
    center: [124.13, 13.67]
  },
  CARAMORAN: {
    name: 'Caramoran',
    bounds: {
      north: 14.10,
      south: 13.95,
      east: 124.25,
      west: 124.12
    },
    center: [124.18, 14.03]
  },
  GIGMOTO: {
    name: 'Gigmoto',
    bounds: {
      north: 13.95,
      south: 13.80,
      east: 124.42,
      west: 124.32
    },
    center: [124.37, 13.88]
  },
  BAGAMANOC: {
    name: 'Bagamanoc',
    bounds: {
      north: 13.87,
      south: 13.72,
      east: 124.32,
      west: 124.22
    },
    center: [124.27, 13.80]
  },
  PANDAN: {
    name: 'Pandan',
    bounds: {
      north: 13.62,
      south: 13.48,
      east: 124.25,
      west: 124.15
    },
    center: [124.20, 13.55]
  },
  VIGA: {
    name: 'Viga',
    bounds: {
      north: 13.95,
      south: 13.80,
      east: 124.42,
      west: 124.32
    },
    center: [124.37, 13.88]
  },
  PANGANIBAN: {
    name: 'Panganiban',
    bounds: {
      north: 14.15,
      south: 14.00,
      east: 124.28,
      west: 124.15
    },
    center: [124.22, 14.08]
  }
};

/**
 * Determine which municipality the user is currently viewing
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {string|null} - Municipality key (e.g., 'VIRAC') or null if outside all boundaries
 */
export const getCurrentMunicipality = (lng, lat) => {
  for (const [key, data] of Object.entries(municipalityBoundaries)) {
    const { bounds } = data;
    if (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    ) {
      return key;
    }
  }
  return null; // Outside all municipalities (e.g., ocean view)
};

/**
 * Check if a coordinate is within a specific municipality
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude  
 * @param {string} municipality - Municipality key (e.g., 'VIRAC')
 * @returns {boolean}
 */
export const isInMunicipality = (lng, lat, municipality) => {
  const data = municipalityBoundaries[municipality];
  if (!data) return false;
  
  const { bounds } = data;
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
};

/**
 * Get municipality name from coordinates
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {string} - Human-readable municipality name or 'Unknown'
 */
export const getMunicipalityName = (lng, lat) => {
  const key = getCurrentMunicipality(lng, lat);
  return key ? municipalityBoundaries[key].name : 'Unknown';
};

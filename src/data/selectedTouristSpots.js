// Selected tourist spots configuration
// Progressive disclosure: markers appear gradually as you zoom in (like Google Maps)
// Optimized for Raspberry Pi 4B 4GB performance

// ZOOM LEVEL REFERENCE (approximate distances):
// Zoom 9  = Province-wide view (~10km+ scale)
// Zoom 13 = ~1km scale
// Zoom 15 = ~500m scale  
// Zoom 16 = ~200m scale
// Zoom 18 = ~50m scale

// Popular spots that get iOS-style image markers
export const popularSpots = [
  // Province-level landmarks (zoom 9)
  'Binurong Point',
  'Bote Lighthouse',
  'Twin Rocks Beach',
  'Maribina Falls',
  'Codon Lighthouse',
  'Palumbanes Island',
  'Nupa Green Lagoon',
  'Paday Falls',
  'Pandan Lighthouse',
  'San Miguel River Park',
  'Tignob Sandbar',
  
  // Municipality-level (zoom 13 - 1km scale)
  'Puraran Beach',
  'Balacay Point',
  'Mamangal Beach Resort',
  'Igang Beach',
  'Marilima Beach',
  'Balongbong Falls',
  'Viga Beach',
  
  // Detailed areas (zoom 15 - 500m scale)
  'Majestic Puraran Beach Resort',
  'Puraran Surf Resort',
  'Igang Chapel Ruins',
  'Bato Church',
  'Mangrove Reserve River Cruise',
  
  // Close-up (zoom 16+ - 200m+ scale)
  'JoSurfInn',
  "L'Astrolabe",
  'Alon Stay'
];

// Selected tourist spots with STRICT zoom-based visibility (Google Maps style)
export const selectedSpots = [
  // ===== ZOOM 9: PROVINCE-WIDE VIEW (Featured Landmarks Only) =====
  // Only show ~11 major landmarks to avoid clutter
  {
    municipality: 'BARAS',
    spotName: 'Binurong Point',
    geojsonFile: 'baras.geojson',
    minZoom: 9
  },
  {
    municipality: 'SAN_ANDRES',
    spotName: 'Codon Lighthouse',
    geojsonFile: 'san_andres.geojson',
    minZoom: 9
  },
  {
    municipality: 'SAN_ANDRES',
    spotName: 'Mamangal Beach Resort',
    geojsonFile: 'san_andres.geojson',
    minZoom: 9
  },
  {
    municipality: 'CARAMORAN',
    spotName: 'Palumbanes Island',
    geojsonFile: 'caramoran.geojson',
    minZoom: 9
  },
  {
    municipality: 'BAGAMANOC',
    spotName: 'Paday Falls',
    geojsonFile: 'bagamanoc.geojson',
    minZoom: 9
  },
  {
    municipality: 'GIGMOTO',
    spotName: 'Nupa Green Lagoon',
    geojsonFile: 'gigmoto.geojson',
    minZoom: 9
  },
  {
    municipality: 'BATO',
    spotName: 'Bote Lighthouse',
    geojsonFile: 'BATO.geojson',
    minZoom: 9
  },
  {
    municipality: 'BATO',
    spotName: 'Maribina Falls',
    geojsonFile: 'BATO.geojson',
    minZoom: 9
  },
  {
    municipality: 'SAN_MIGUEL',
    spotName: 'San Miguel River Park',
    geojsonFile: 'san_miguel.geojson',
    minZoom: 9
  },
  {
    municipality: 'VIRAC',
    spotName: 'Twin Rocks Beach',
    geojsonFile: 'VIRAC.geojson',
    minZoom: 9
  },
  {
    municipality: 'PANDAN',
    spotName: 'Pandan Lighthouse',
    geojsonFile: 'pandan.geojson',
    minZoom: 9
  },

  // ===== ZOOM 13: ~1KM SCALE (Municipality-level spots) =====
  // BARAS
  {
    municipality: 'BARAS',
    spotName: 'Puraran Beach',
    geojsonFile: 'baras.geojson',
    minZoom: 13  // Only 1 marker at 1km scale
  },
  {
    municipality: 'BARAS',
    spotName: 'Balacay Point',
    geojsonFile: 'baras.geojson',
    minZoom: 13
  },
  
  // VIRAC
  {
    municipality: 'VIRAC',
    spotName: 'Igang Beach',
    geojsonFile: 'VIRAC.geojson',
    minZoom: 13
  },
  {
    municipality: 'VIRAC',
    spotName: 'Marilima Beach',
    geojsonFile: 'VIRAC.geojson',
    minZoom: 13
  },
  
  // BATO
  {
    municipality: 'BATO',
    spotName: 'Balongbong Falls',
    geojsonFile: 'BATO.geojson',
    minZoom: 13
  },
  
  // VIGA
  {
    municipality: 'VIGA',
    spotName: 'Viga Beach',
    geojsonFile: 'viga.geojson',
    minZoom: 13
  },
  
  // PANGANIBAN
  {
    municipality: 'PANGANIBAN',
    spotName: 'Tignob Sandbar',
    geojsonFile: 'panganiban.geojson',
    minZoom: 13
  },

  // ===== ZOOM 15: ~500M SCALE (2 markers visible in Puraran) =====
  {
    municipality: 'BARAS',
    spotName: 'Majestic Puraran Beach Resort',
    geojsonFile: 'baras.geojson',
    minZoom: 15  // 2nd marker at 500m scale
  },
  {
    municipality: 'BARAS',
    spotName: 'Puraran Surf Resort',
    geojsonFile: 'baras.geojson',
    minZoom: 15  // 2nd marker at 500m scale
  },
  
  // VIRAC
  {
    municipality: 'VIRAC',
    spotName: 'Igang Chapel Ruins',
    geojsonFile: 'VIRAC.geojson',
    minZoom: 15
  },
  
  // BATO
  {
    municipality: 'BATO',
    spotName: 'Bato Church',
    geojsonFile: 'BATO.geojson',
    minZoom: 15
  },
  
  // PANDAN
  {
    municipality: 'PANDAN',
    spotName: 'Mangrove Reserve River Cruise',
    geojsonFile: 'pandan.geojson',
    minZoom: 15
  },

  // ===== ZOOM 16: ~200M SCALE (JoSurfInn & L'Astrolabe appear) =====
  {
    municipality: 'BARAS',
    spotName: 'JoSurfInn',
    geojsonFile: 'baras.geojson',
    minZoom: 16  // Appears at 200m scale
  },
  {
    municipality: 'BARAS',
    spotName: "L'Astrolabe",
    geojsonFile: 'baras.geojson',
    minZoom: 16  // Appears at 200m scale
  },

  // ===== ZOOM 18: ~50M SCALE (Alon Stay appears) =====
  {
    municipality: 'BARAS',
    spotName: 'Alon Stay',
    geojsonFile: 'baras.geojson',
    minZoom: 18  // Only visible at 50m scale
  }
];

// Load additional spots from municipalities (HIGHER zoom thresholds for performance)
export const loadAllSpotsFrom = [
  {
    municipality: 'VIRAC',
    geojsonFile: 'VIRAC.geojson',
    excludeSpots: [
      'Twin Rocks Beach',
      'Igang Beach',
      'Marilima Beach',
      'Igang Chapel Ruins'
    ],
    minZoom: 15  // Virac spots appear at 500m scale (not earlier)
  },
  {
    municipality: 'BARAS',
    geojsonFile: 'baras.geojson',
    excludeSpots: [
      'Binurong Point',
      'Puraran Beach',
      'Majestic Puraran Beach Resort',
      'Puraran Surf Resort',
      'JoSurfInn',
      "L'Astrolabe",
      'Alon Stay',
      'Balacay Point'
    ],
    minZoom: 16  // Other Baras spots at 200m scale
  },
  {
    municipality: 'SAN_ANDRES',
    geojsonFile: 'san_andres.geojson',
    excludeSpots: [
      'Mamangal Beach Resort',
      'Codon Lighthouse'
    ],
    minZoom: 15
  },
  {
    municipality: 'BATO',
    geojsonFile: 'BATO.geojson',
    excludeSpots: [
      'Bote Lighthouse',
      'Maribina Falls',
      'Balongbong Falls',
      'Bato Church'
    ],
    minZoom: 15
  },
  {
    municipality: 'SAN_MIGUEL',
    geojsonFile: 'san_miguel.geojson',
    excludeSpots: [
      'San Miguel River Park'
    ],
    minZoom: 15
  },
  {
    municipality: 'CARAMORAN',
    geojsonFile: 'caramoran.geojson',
    excludeSpots: [
      'Palumbanes Island'
    ],
    minZoom: 15
  },
  {
    municipality: 'GIGMOTO',
    geojsonFile: 'gigmoto.geojson',
    excludeSpots: [
      'Nupa Green Lagoon'
    ],
    minZoom: 15
  },
  {
    municipality: 'BAGAMANOC',
    geojsonFile: 'bagamanoc.geojson',
    excludeSpots: [
      'Paday Falls'
    ],
    minZoom: 15
  },
  {
    municipality: 'PANDAN',
    geojsonFile: 'pandan.geojson',
    excludeSpots: [
      'Pandan Lighthouse',
      'Mangrove Reserve River Cruise'
    ],
    minZoom: 15
  },
  {
    municipality: 'VIGA',
    geojsonFile: 'viga.geojson',
    excludeSpots: [
      'Viga Beach'
    ],
    minZoom: 15
  },
  {
    municipality: 'PANGANIBAN',
    geojsonFile: 'panganiban.geojson',
    excludeSpots: [
      'Tignob Sandbar'
    ],
    minZoom: 15
  }
];

// Helper function to convert municipality name to sentence case
export const toSentenceCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Category colors for the pill badges
export const categoryColors = {
  BEACH: { bg: '#dbeafe', text: '#1e40af' },
  WATERFALL: { bg: '#d1fae5', text: '#065f46' },
  VIEWPOINT: { bg: '#fce7f3', text: '#9f1239' },
  NATURE: { bg: '#dcfce7', text: '#14532d' },
  ACCOMMODATION: { bg: '#fef3c7', text: '#92400e' },
  RESORT: { bg: '#fed7aa', text: '#9a3412' },
  CAFE: { bg: '#e0e7ff', text: '#3730a3' },
  RESTAURANT: { bg: '#fecaca', text: '#991b1b' },
  MUSEUM: { bg: '#e9d5ff', text: '#6b21a8' },
  HERITAGE: { bg: '#f3e8ff', text: '#581c87' },
  RELIGIOUS_SITE: { bg: '#ddd6fe', text: '#4c1d95' },
  SURFING: { bg: '#bfdbfe', text: '#1e3a8a' },
  LANDMARK: { bg: '#fbbf24', text: '#78350f' },
  ECO_PARK: { bg: '#86efac', text: '#14532d' },
  HIKING: { bg: '#fdba74', text: '#7c2d12' },
  ISLAND: { bg: '#99f6e4', text: '#134e4a' },
  BAR: { bg: '#fca5a5', text: '#7f1d1d' },
  PARK: { bg: '#bef264', text: '#3f6212' },
  LAGOON: { bg: '#a5f3fc', text: '#155e75' },
  RIVER: { bg: '#bae6fd', text: '#0c4a6e' },
  LIGHTHOUSE: { bg: '#fde68a', text: '#92400e' },
  SANDBAR: { bg: '#fed7aa', text: '#9a3412' },
  MANGROVE: { bg: '#86efac', text: '#166534' },
  RUINS: { bg: '#e9d5ff', text: '#6b21a8' },
  default: { bg: '#f3f4f6', text: '#1f2937' }
};

// Category icons mapping (Font Awesome classes)
export const categoryIcons = {
  BEACH: 'fa-umbrella-beach',
  WATERFALL: 'fa-water',
  VIEWPOINT: 'fa-mountain',
  NATURE: 'fa-tree',
  ACCOMMODATION: 'fa-bed',
  RESORT: 'fa-hotel',
  CAFE: 'fa-mug-hot',
  RESTAURANT: 'fa-utensils',
  MUSEUM: 'fa-landmark',
  HERITAGE: 'fa-monument',
  RELIGIOUS_SITE: 'fa-place-of-worship',
  SURFING: 'fa-person-swimming',
  LANDMARK: 'fa-flag',
  ECO_PARK: 'fa-leaf',
  HIKING: 'fa-hiking',
  ISLAND: 'fa-island-tropical',
  BAR: 'fa-martini-glass',
  PARK: 'fa-tree-city',
  LAGOON: 'fa-droplet',
  RIVER: 'fa-water',
  LIGHTHOUSE: 'fa-lighthouse',
  SANDBAR: 'fa-water',
  MANGROVE: 'fa-tree',
  RUINS: 'fa-monument',
  default: 'fa-location-dot'
};
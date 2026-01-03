# Vite + React + Tailwind CSS + MapLibre

This project uses the **latest** versions of:
- Vite
- React
- Tailwind CSS (with @tailwindcss/postcss plugin)
- Lucide React (for icons)
- MapLibre GL (for interactive maps)
- React Map GL (MapLibre wrapper)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up MapTiler API Key
1. Create a free account at [MapTiler](https://www.maptiler.com/)
2. Get your API key from the [MapTiler Cloud](https://cloud.maptiler.com/account/keys/)
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Add your MapTiler API key to `.env`:
   ```
   VITE_MAPTILER_API_KEY=your_actual_api_key_here
   ```

### 3. Run the development server
```bash
npm run dev
```

## Features
- **Interactive Map**: MapLibre-powered map showing Catanduanes province
- **Toner Style**: Clean, high-contrast black and white map style
- **Responsive Layout**: Split-panel design with map on the right
- **Map Controls**: Built-in navigation controls (zoom, rotate)

## Structure
- `/src/pages/Explore` - Main explore page
- `/src/components/FloatingCard` - Reusable card component with two panels:
  - Left panel: Content area (50% width, gray background)
  - Right panel: Map container (50% width, dark background)
- `/src/components/MapView` - MapLibre map component centered on Catanduanes

## Map Configuration
- **Location**: Catanduanes Province, Philippines
- **Coordinates**: 124.2475°E, 13.8°N
- **Zoom Level**: 9.5
- **Style**: MapTiler Toner v2

## Environment Variables
- `VITE_MAPTILER_API_KEY` - Your MapTiler API key (required for map rendering)

## Notes
- `.gitignore` is configured to exclude `.env` files for security
- `.env.example` is provided as a template
- `node_modules` and build outputs are excluded
- Tailwind CSS is configured with PostCSS

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // RPI Optimization
  build: {
    target: 'es2015', // Better browser compatibility
    minify: 'terser',  // Better compression than esbuild
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Code splitting for lazy loading
          'react-vendor': ['react', 'react-dom'],
          'map-vendor': ['maplibre-gl'],
          'ui-vendor': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,  // Split CSS for faster loading
    sourcemap: false  // Disable sourcemaps in production
  },
  
  // Performance settings
  optimizeDeps: {
    include: ['react', 'react-dom', 'maplibre-gl', 'lucide-react'],
    exclude: []
  },
  
  server: {
    hmr: {
      overlay: false  // Disable error overlay for kiosk mode
    }
  }
})

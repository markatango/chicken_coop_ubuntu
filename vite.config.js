import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Base path for assets (relative paths for local serving)
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  
  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate source maps for production debugging
    sourcemap: true,
    
    // Clean the output directory before building
    emptyOutDir: true,
    
    // Assets handling
    assetsDir: 'assets',
    
    // Rollup options for more control over the build
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge']
        },
        // Asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const extType = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          if (/\.css$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        // JS chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      },
      // External dependencies (if needed)
      external: (id) => {
        // Don't bundle Firebase if it's causing issues
        return false;
      }
    },
    
    // Target browsers
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
    
    // Minification
    minify: 'esbuild',
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inlining threshold (in bytes)
    assetsInlineLimit: 4096
  },
  
  // Public directory files to copy
  publicDir: 'public',
  
  // Server configuration
  server: {
    allowedHosts: true,
    port: 3000,
    open: true,
    host: '0.0.0.0'
  },
  
  // Preview server configuration (for production build preview)
  preview: {
    port: 3000,
    host: '0.0.0.0'
  },
  
  // Environment variables
  envPrefix: 'REACT_APP_',
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@config': resolve(__dirname, 'src/config')
    }
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      'firebase',
      '@firebase/app',
      '@firebase/auth',
      '@firebase/firestore',
      '@firebase/analytics',
      '@firebase/storage'
    ]
  },
  
  // ESBuild options
  esbuild: {
    // Handle Firebase's dynamic imports
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  
  // CSS preprocessing
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  
  // Worker configuration
  worker: {
    format: 'es'
  },
  
  // JSON configuration
  json: {
    namedExports: true,
    stringify: false
  }
})
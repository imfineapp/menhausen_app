import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/styles": path.resolve(__dirname, "./styles"),
      "@/types": path.resolve(__dirname, "./types"),
      "@/imports": path.resolve(__dirname, "./imports"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://telegram.org https://*.telegram.org https://lopata.menhausen.com; connect-src 'self' http://127.0.0.1:* http://localhost:* https://telegram.org https://*.telegram.org https://lopata.menhausen.com; object-src 'none';"
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // Radix UI components (large component library)
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          
          // UI and styling libraries
          if (id.includes('lucide-react') || id.includes('sonner') || 
              id.includes('motion') || id.includes('class-variance-authority') ||
              id.includes('tailwind') || id.includes('clsx')) {
            return 'ui-components';
          }
          
          // Chart and visualization libraries
          if (id.includes('recharts') || id.includes('embla-carousel')) {
            return 'charts-carousel';
          }
          
          // Form and interaction libraries
          if (id.includes('react-hook-form') || id.includes('react-dnd') ||
              id.includes('input-otp') || id.includes('react-day-picker')) {
            return 'forms-interaction';
          }
          
          // Additional utility libraries
          if (id.includes('next-themes') || id.includes('cmdk') ||
              id.includes('@floating-ui') || id.includes('react-resizable') ||
              id.includes('react-slick') || id.includes('react-responsive-masonry')) {
            return 'utilities';
          }
          
          // Large node_modules that don't fit above categories
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
          
          // App components by directory
          if (id.includes('/components/ui/')) {
            return 'app-ui-components';
          }
          
          if (id.includes('/components/') && !id.includes('/components/ui/')) {
            return 'app-components';
          }
          
          if (id.includes('/imports/')) {
            return 'app-imports';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'sonner',
      'react-hook-form',
      'recharts',
      'framer-motion',
    ],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  esbuild: {
    target: 'esnext',
  },
})
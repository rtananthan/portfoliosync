import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts-vendor': ['recharts'],
          'icons-vendor': ['lucide-react'],
          
          // App chunks
          'pages': [
            './src/pages/HomePage.tsx',
            './src/pages/StocksPage.tsx',
            './src/pages/ETFs.tsx',
            './src/pages/Properties.tsx',
            './src/pages/BenchmarkPage.tsx'
          ],
          'components': [
            './src/components/AssetAllocationChart.tsx',
            './src/components/PerformanceTrendChart.tsx',
            './src/components/TopPerformers.tsx',
            './src/components/PortfolioGrowthTimeline.tsx'
          ],
          'services': [
            './src/services/stocksService.ts',
            './src/services/etfService.ts',
            './src/services/propertyService.ts',
            './src/services/benchmarkService.ts'
          ]
        }
      }
    },
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: process.env.VITE_DEV_PORT ? parseInt(process.env.VITE_DEV_PORT) : 3000,
    open: process.env.VITE_DEV_OPEN_BROWSER !== 'false',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts', 'lucide-react'],
  },
})
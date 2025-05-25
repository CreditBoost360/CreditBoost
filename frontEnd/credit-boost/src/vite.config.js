import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    target: ['es2015', 'chrome58', 'firefox57', 'safari11', 'edge16'],
    polyfillDynamicImport: true,
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@tremor/react', '@radix-ui/react-icons']
        }
      }
    },
    minify: process.env.NODE_ENV === 'production',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production',
      }
    },
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' data: blob: https: http:;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' https://credvault.co.ke http://localhost:3000 http://localhost:8081 https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        upgrade-insecure-requests;
      `.replace(/\s+/g, ' ').trim(),
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-site',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});
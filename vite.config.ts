
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    host: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react', '@google/genai'],
  },
});

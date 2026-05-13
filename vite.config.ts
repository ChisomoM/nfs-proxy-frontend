import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  server: {
    port: 6060,
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8020',
    //     changeOrigin: true,
    //   },

    },
  //    proxy: {
  //    '/api': {
  //      target: 'https://nfs-proxy.mygeepay.com',
  //      changeOrigin: true,
  //      rewrite: (path) => path.replace(/^\/api/, '')
  //    }
  //  }
  // },
})

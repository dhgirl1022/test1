import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.imonnit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/json'),
        secure: true,
      },
    },
  },
})

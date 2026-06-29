import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contact: resolve(__dirname, 'contact.html'),
        'ai-1on1': resolve(__dirname, 'ai-1on1.html'),
        blog: resolve(__dirname, 'blog.html'),
        post: resolve(__dirname, 'post.html'),
        photography: resolve(__dirname, 'photography.html')
      }
    }
  }
})
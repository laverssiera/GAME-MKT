import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/vue/') || id.includes('/pinia/')) return 'vendor-vue'
          if (id.includes('/three/')) return 'vendor-three'
          if (id.includes('/motion/') || id.includes('/framer-motion/')) return 'vendor-motion'
          return 'vendor'
        },
      },
    },
  },
})

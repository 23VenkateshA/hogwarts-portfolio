import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base path: served from https://<user>.github.io/hogwarts-portfolio/ in production
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/hogwarts-portfolio/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 5173,
  },
}))

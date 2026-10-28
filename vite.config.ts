import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 4173 },
  // sem o polyfill de preload, o bundle não tem nenhuma chamada de rede
  build: { modulePreload: { polyfill: false } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})

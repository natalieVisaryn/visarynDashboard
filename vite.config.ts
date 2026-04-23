import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // multicoin-address-validator expects Node's `global` (e.g. for Buffer)
    global: "globalThis",
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  // server: {
  //   host: '0.0.0.0',  // Allow access from other devices
  //   port: 5173,       // You can change this port
  //   strictPort: true, // Ensures the port doesn’t change if busy
  // },
  plugins: [tailwindcss(),react()],
})

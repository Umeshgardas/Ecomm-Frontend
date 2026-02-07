import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "https://ecomm-backend-xydc.onrender.com",
    },
  },
  css: {
    devSourcemap: true,
  },
  build: {
    cssCodeSplit: false, // This can help with CSS loading issues
  },
});

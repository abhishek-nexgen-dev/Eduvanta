import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    host: "0.0.0.0",
    port: 1420,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "https://ciitm-backend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "https://ciitm-backend.onrender.com",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === "INVALID_ANNOTATION") {
          return;
        }
        defaultHandler(warning);
      },
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          icons: ["lucide-react", "react-icons"],
        },
      },
    },
  },
}));

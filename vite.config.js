import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(__dirname, "client");

export default defineConfig({
  root: clientRoot,
  publicDir: "public",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "PrivyHealth Pakistan",
        short_name: "PrivyHealth",
        description: "Encrypted patient-owned medical records on WireFluid blockchain",
        theme_color: "#0a1628",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      }
    })
  ],
  resolve: { alias: { "@": path.resolve(clientRoot, "src") } },
  define: { global: "globalThis" },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://127.0.0.1:3001", changeOrigin: true }
    }
  },
  preview: {
    port: 4173,
    host: true,
    proxy: {
      "/api": { target: "http://127.0.0.1:3001", changeOrigin: true }
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          ethers: ["ethers"],
          query: ["@tanstack/react-query"],
          icons: ["lucide-react"]
        }
      }
    }
  }
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/SunFiles/",
  build: {
    outDir: "./build",
    emptyOutDir: true,
  },

  resolve: {
    alias: {
      "@": "/src/",
      "@pb": "/public/",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `;`,
      },
    },
    modules: {
      scopeBehaviour: "local",
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
});

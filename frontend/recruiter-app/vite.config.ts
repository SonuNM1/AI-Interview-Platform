import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),

    tailwindcss(),

    federation({
      name: "recruiter",

      filename: "remoteEntry.js",

      exposes: {
        "./App": "./src/App.tsx",
      },

      shared: {
        react: {
          singleton: true,
        },

        "react-dom": {
          singleton: true,
        },

        "react-router-dom": {
          singleton: true,
        },
      },

      dts: false,
    }),
  ],

  server: {
    port: 3002,
    origin: "http://localhost:3002",
  },

  build: {
    target: "chrome89",
  },
});
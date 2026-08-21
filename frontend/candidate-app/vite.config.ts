import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),

    federation({
      // Unique name of the remote application
      name: "candidate",

      // Entry file generated for the host
      filename: "remoteEntry.js",

      // Components exposed to other applications
      exposes: {
        "./App": "./src/App.tsx",
      },

      // Share React with the host
      shared: ["react", "react-dom"],

      dts: false, // we will handle TS declarations ourselves for now
    }),
  ],

  server: {
    port: 3001,
    origin: "http://localhost:3001",
  },

  build: {
    target: "chrome89",
  },
});
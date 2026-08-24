import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),

    federation({
      name: "candidate",

      filename: "remoteEntry.js",

      exposes: {
        "./App": "./src/App.tsx",
      },

      remotes: {
        shell: {
          type: "module",
          name: "shell",
          entry: "http://localhost:3000/assets/remoteEntry.js",
        },
      },

      shared: ["react", "react-dom", "react-router-dom"],

      dts: false,
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

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),

    federation({
      // Shell is our host application
      name: "shell",

      // Remote applications consumed by Shell
      remotes: {
        candidate: {
          type: "module",
          name: "candidate",
          entry: "http://localhost:3001/remoteEntry.js",
        },
      },

      // Share React between applications
      shared: ["react", "react-dom"],

      dts: false, 
    }),
  ],

  server: {
    port: 3000,
  },

  build: {
    target: "chrome89",
  },
});
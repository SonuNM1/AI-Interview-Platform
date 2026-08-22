import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),

    // Tailwind CSS v4

    tailwindcss(),

    federation({
      name: "shell",

      remotes: {
        candidate: {
          type: "module",
          name: "candidate",
          entry: "http://localhost:3001/remoteEntry.js",
        },
      },

      // React is shared between Shell and remote applications.

      shared: ["react", "react-dom"],

      dts: false,
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 3000,
  },

  build: {
    target: "chrome89",
  },
});
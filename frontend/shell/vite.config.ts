import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load frontend environment variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
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
            entry: `${env.VITE_CANDIDATE_APP_URL}/remoteEntry.js`,
          },

          recruiter: {
            type: "module",
            name: "recruiter",
            entry: `${env.VITE_RECRUITER_APP_URL}/remoteEntry.js`,
          },

          mentor: {
            type: "module",
            name: "mentor",
            entry: `${env.VITE_MENTOR_APP_URL}/remoteEntry.js`,
          },
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
  };
});
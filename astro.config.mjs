import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import db from "@astrojs/db";
import netlify from "@astrojs/netlify";

import simpleStackForm from "simple-stack-form";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: netlify(),
  integrations: [db(), simpleStackForm()],
  vite: {
    optimizeDeps: {
      exclude: ["oslo"]
    }
  },
  server: {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
    }
  }
});
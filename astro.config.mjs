// @ts-check
import { defineConfig, passthroughImageService, sharpImageService } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// disable image optimization in dev mode to allow the project to work on StackBlitz
const disableImageOptimization = process.env.NODE_ENV === "development";

// https://astro.build/config
export default defineConfig({
  trailingSlash: "never",
  site: "https://lennysiol.com",
  vite: {
    plugins: [
      tailwindcss(),
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/three/examples/jsm/loaders/GLTFLoader.js',
            dest: 'lib'
          }
        ]
      })
    ],
  },
  integrations: [mdx(), icon(), sitemap(), react()],
  image: {
    service: disableImageOptimization
      ? passthroughImageService()
      : sharpImageService(),
  },
});

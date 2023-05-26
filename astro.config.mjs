import { defineConfig } from 'astro/config';
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  site: 'https://lennysiol.com/',
  base: 'https://github.com/Paccolocco/Paccolocco.github.io',
  integrations: [image({
    serviceEntryPoint: "@astrojs/image/sharp"
  })]
});

// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import partytown from "@astrojs/partytown";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://ai-blog-automatizado.vercel.app/",
  output: "static",
  adapter: vercel(),
  integrations: [
    mdx(),
    sitemap(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],

  // Agregar configuración para imágenes remotas
  image: {
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
});

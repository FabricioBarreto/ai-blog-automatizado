import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";
import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: "https://www.productivitylab.online",
  output: "static",
  integrations: [
    mdx(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes("/dashboard/"),
    }),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    compress({
      // Comprimir CSS
      CSS: {
        csso: {
          restructure: true,
          forceMediaMerge: false,
          comments: false,
        },
      },
      // Comprimir HTML
      HTML: {
        "html-minifier-terser": {
          removeAttributeQuotes: false,
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true,
        },
      },
      // Comprimir JavaScript
      JavaScript: {
        terser: {
          compress: {
            drop_console: true, // Remover console.log en producción
            passes: 2,
          },
          mangle: true,
          format: {
            comments: false,
          },
        },
      },
      // Comprimir imágenes
      Image: {
        avif: {
          quality: 80,
        },
        webp: {
          quality: 85,
        },
        jpg: {
          quality: 85,
        },
        png: {
          quality: 85,
        },
      },
      // Comprimir SVG
      SVG: {
        svgo: {
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  removeViewBox: false,
                  cleanupIds: false,
                },
              },
            },
          ],
        },
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
          },
        },
      },
    },
  },
});

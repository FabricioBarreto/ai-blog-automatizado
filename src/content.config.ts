import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}",
    // No generar error si la carpeta está vacía
    generateId: ({ entry }) => entry,
  }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
      author: z.string().optional().default("AI Blog Team"),
    }),
});

export const collections = { blog };

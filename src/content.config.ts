import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) => entry,
  }),
  schema: () =>
    z
      .object({
        title: z.string(),
        description: z.string(),

        // ✅ Compatibilidad: algunos posts viejos tienen publishDate
        pubDate: z.coerce.date().optional(),
        publishDate: z.coerce.date().optional(),

        updatedDate: z.coerce.date().optional(),
        heroImage: z.string().optional(),

        tags: z.array(z.string()).optional().default([]),
        author: z.string().optional().default("AI Blog Team"),

        // ✅ Campos útiles para monetizados
        category: z.string().optional(),
        featured: z.boolean().optional(),
      })
      .transform((data) => {
        return {
          ...data,
          pubDate: data.pubDate ?? data.publishDate ?? new Date(),
        };
      }),
});

export const collections = { blog };

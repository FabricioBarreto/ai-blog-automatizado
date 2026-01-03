import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blogSchema = z
  .object({
    // ===== Campos obligatorios =====
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),

    // ===== Fechas (compatibilidad con posts antiguos) =====
    pubDate: z.coerce.date().optional(),
    publishDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),

    // ===== Imágenes (acepta string, null, o undefined) =====
    heroImage: z.string().nullable().optional(),

    // ===== Taxonomía =====
    category: z
      .enum([
        "IA",
        "Productividad",
        "Desarrollo",
        "Hardware",
        "Automatización",
        "Tutoriales",
        "Reviews",
      ])
      .optional(),
    tags: z.array(z.string()).default([]),

    // ===== Metadata =====
    author: z.string().default("AI Tools Hub"),
    readingTime: z.string().optional(),

    // ===== SEO & Monetización =====
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),

    // ===== Campos opcionales útiles =====
    excerpt: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    relatedPosts: z.array(z.string()).optional(),
  })
  .strict()
  .transform((data) => {
    // Normalizar fecha de publicación
    const pubDate = data.pubDate ?? data.publishDate ?? new Date();

    // Calcular reading time si no existe (aproximado)
    const readingTime = data.readingTime ?? "5 min";

    // Usar description como excerpt si no hay excerpt
    const excerpt = data.excerpt ?? data.description.slice(0, 150);

    return {
      ...data,
      pubDate,
      readingTime,
      excerpt,
    };
  });

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) => entry,
  }),
  schema: blogSchema,
});

export const collections = { blog };

// ===== Tipos exportados para usar en componentes =====
export type BlogPost = z.infer<typeof blogSchema>;
export type BlogCategory = BlogPost["category"];

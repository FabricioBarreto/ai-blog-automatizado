// scripts/generate-article.js
import "dotenv/config";
import OpenAI from "openai";
import axios from "axios";
import fs from "fs";
import path from "path";

// Configuración OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Keywords de nicho: IA y Productividad
const KEYWORDS = [
  "best ai tools for content creation",
  "chatgpt vs claude comparison",
  "ai productivity tools 2025",
  "how to use ai for marketing",
  "midjourney tutorial beginners",
  "ai writing assistants review",
  "best ai image generators",
  "ai automation tools for business",
  "notion ai features guide",
  "canva ai magic studio review",
  "dall-e 3 vs midjourney comparison",
  "free ai tools for startups",
  "cursor ai coding assistant review",
  "github copilot alternatives",
  "best ai chrome extensions",
];

// Usar keyword personalizada o seleccionar aleatoria
const keyword =
  process.env.CUSTOM_KEYWORD ||
  KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];

async function generateArticle() {
  try {
    console.log(`🎯 Generating article for: ${keyword}`);

    const today = new Date().toISOString().split("T")[0];

    // Prompt profesional optimizado
    const prompt = `You are an expert SEO content writer specializing in AI tools and productivity software.

Your writing style is:
- Clear and conversational, but professional
- Data-driven with concrete examples
- Actionable with practical tips readers can apply immediately
- Engaging, written from the perspective of an experienced practitioner
- SEO-optimized naturally (no keyword stuffing)

Write a comprehensive blog post about: "${keyword}"

Structure:

1. Hook Introduction (100–150 words)
- Start with a relatable problem, pain point, or surprising statistic
- Clearly state what the reader will learn
- Motivate them to continue reading

2. Main Content (1,000–1,200 words total)
- 5 to 7 sections using H2 headers
- Each section should be 150–200 words
- Use bullet points or numbered lists where appropriate for scannability
- Include real-world examples and use cases
- Compare 2–3 tools when relevant and explain trade-offs
- Write in second person ("you") when giving advice

3. Actionable Conclusion (100–150 words)
- Summarize the key takeaways
- Provide one clear next step the reader can take today
- End with a thoughtful question to encourage engagement

SEO Requirements:
- Primary keyword: "${keyword}"
- Include related and semantically relevant keywords naturally
- Mention 2–3 related internal topics (without linking explicitly)
- Reference 1–2 authoritative external sources (describe them, do not invent URLs)
- Generate a meta description (max 155 characters) including the primary keyword

Formatting Requirements:
- Use proper Markdown syntax
- Keep paragraphs short (2–4 sentences)
- Use **bold** and *italic* emphasis sparingly and naturally
- Include code blocks if relevant, with language tags

Output format (STRICT — do not add explanations before or after):

---
title: [Catchy, keyword-rich title (50–60 characters)]
description: [Meta description with CTA, max 155 characters]
pubDate: ${today}
heroImage: '/images/placeholder.jpg'
tags: ['AI Tools', 'Productivity', 'Tutorial']
author: 'AI Blog Team'
---

[Full markdown article content]`;

    console.log("📝 Calling OpenAI API...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2600,
    });

    const articleContent = completion.choices[0].message.content;
    console.log("✅ Article content generated");

    // Descargar imagen desde Pexels
    const imageQuery = keyword.split(" ").slice(0, 3).join(" ");
    const imageUrl = await downloadImageFromPexels(imageQuery);

    // Reemplazar imagen placeholder
    const finalContent = articleContent.replace(
      "/images/placeholder.jpg",
      imageUrl
    );

    // Generar slug
    const slug = keyword
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const filename = `${today}-${slug}.md`;
    const filepath = path.join("src", "content", "blog", filename);

    // Asegurar que el directorio existe
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, finalContent, "utf-8");

    console.log(`✅ Article saved: ${filename}`);

    // Estimación de costos
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(articleContent.length / 4);
    const cost = (inputTokens * 0.15 + outputTokens * 0.6) / 1_000_000;
    console.log(`💰 Estimated cost: $${cost.toFixed(4)}`);

    console.log(`
🎉 SUCCESS! Article generated:
   📄 File: ${filename}
   🔑 Keyword: ${keyword}
   💵 Cost: $${cost.toFixed(4)}
`);
  } catch (error) {
    console.error("❌ Error generating article:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    process.exit(1);
  }
}

async function downloadImageFromPexels(query) {
  try {
    if (!process.env.PEXELS_API_KEY) {
      console.log("⚠️  No Pexels API key, using default image");
      return "/images/default-hero.jpg";
    }

    console.log(`🖼️  Searching image for: ${query}`);

    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      params: {
        query,
        per_page: 1,
        orientation: "landscape",
      },
    });

    if (!response.data.photos || response.data.photos.length === 0) {
      console.log("⚠️  No photos found, using default image");
      return "/images/default-hero.jpg";
    }

    const photo = response.data.photos[0];
    console.log(`📥 Downloading image from Pexels...`);

    const imageResponse = await axios.get(photo.src.large, {
      responseType: "arraybuffer",
      timeout: 30000, // 30 segundos timeout
    });

    const filename = `${Date.now()}.jpg`;
    const filepath = path.join("public", "images", filename);

    // Asegurar que el directorio existe
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, imageResponse.data);

    console.log(`✅ Image downloaded: ${filename}`);
    return `/images/${filename}`;
  } catch (error) {
    console.error("⚠️  Error downloading image:", error.message);
    console.log("Using default image instead");
    return "/images/default-hero.jpg";
  }
}

// Ejecutar
generateArticle().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

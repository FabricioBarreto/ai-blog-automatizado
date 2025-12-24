// scripts/generate-smart-article.js
// ✅ Generación inteligente con research real + datos de Amazon API

import "dotenv/config";
import OpenAI from "openai";
import axios from "axios";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio"; // npm install cheerio

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY; // https://serper.dev (gratis 2500 búsquedas/mes)

// ===== PASO 1: RESEARCH DE KEYWORDS =====
async function researchKeyword(baseKeyword) {
  console.log(`🔍 Researching: ${baseKeyword}`);

  // Búsqueda en Google via Serper
  const response = await axios.post(
    "https://google.serper.dev/search",
    {
      q: baseKeyword,
      num: 10,
      gl: "us",
      hl: "en",
    },
    {
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const topResults = response.data.organic || [];

  // Extraer títulos y snippets de competencia
  const competitorInsights = topResults.slice(0, 5).map((r) => ({
    title: r.title,
    snippet: r.snippet,
    url: r.link,
  }));

  // Related searches (para semantic keywords)
  const relatedSearches =
    response.data.relatedSearches?.map((r) => r.query) || [];

  console.log(`✅ Found ${competitorInsights.length} competitors`);
  console.log(`📊 Related: ${relatedSearches.slice(0, 3).join(", ")}`);

  return { competitorInsights, relatedSearches };
}

// ===== PASO 2: SCRAPE PRODUCTOS DE AMAZON =====
async function getAmazonProducts(keyword, count = 5) {
  console.log(`🛒 Fetching Amazon products for: ${keyword}`);

  try {
    // Opción A: Amazon Product Advertising API (necesita aprobación)
    // Opción B: Web scraping (grey area legal, usar con cuidado)
    // Opción C: Base de datos manual (más seguro)

    // Por ahora, simulamos con productos reales que vos curás manualmente
    const CURATED_PRODUCTS = {
      "best mechanical keyboards": [
        {
          asin: "B0BK3RGLX3",
          name: "Keychron K8 Pro",
          price: "$109",
          rating: 4.5,
          features: ["Hot-swappable", "Wireless", "QMK/VIA"],
        },
        {
          asin: "B07S92QBCM",
          name: "Logitech MX Keys",
          price: "$119",
          rating: 4.6,
          features: ["Perfect-Stroke keys", "Multi-device", "Backlit"],
        },
      ],
      // Agregar más categorías...
    };

    const products = CURATED_PRODUCTS[keyword.toLowerCase()] || [];

    if (products.length === 0) {
      console.warn(`⚠️ No products found for: ${keyword}`);
    }

    return products.slice(0, count);
  } catch (error) {
    console.error("❌ Error fetching Amazon products:", error.message);
    return [];
  }
}

// ===== PASO 3: GENERAR ARTÍCULO CON GPT-4 (NO MINI) =====
async function generateArticle(keyword) {
  const today = new Date().toISOString().split("T")[0];

  // Research
  const { competitorInsights, relatedSearches } = await researchKeyword(
    keyword
  );
  const products = await getAmazonProducts(keyword, 5);

  if (products.length === 0) {
    throw new Error(`No products available for keyword: ${keyword}`);
  }

  // Contexto para GPT
  const competitorContext = competitorInsights
    .map((c, i) => `${i + 1}. ${c.title}\n   ${c.snippet}`)
    .join("\n\n");

  const productContext = products
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} - ${p.price} (${p.rating}⭐) - ${p.features.join(
          ", "
        )}`
    )
    .join("\n");

  const prompt = `Sos un experto en SEO y redacción de contenido para blogs de tecnología y productividad.

**Keyword principal:** "${keyword}"

**Contexto de competencia (top 5 en Google):**
${competitorContext}

**Productos a incluir (Amazon Afiliados):**
${productContext}

**Semantic keywords relacionadas:**
${relatedSearches.join(", ")}

**TU TAREA:**

Escribí un artículo completo en ESPAÑOL ARGENTINO (voseo: "vos tenés", "elegí", etc.) que:

1. **Supere a la competencia**: Analizá los títulos/snippets de arriba y creá contenido MÁS completo, con más datos concretos, comparaciones detalladas.

2. **SEO on-point**:
   - Title tag: 50-60 caracteres, keyword al principio
   - Meta description: 150-155 caracteres, CTA clara
   - Usá las semantic keywords naturalmente (no stuffing)
   - Mínimo 3 H2, cada uno con keyword o variación

3. **Estructura ganadora**:
   - Hook: Problema real + dato sorprendente (ej: "El 68% de trabajadores remotos sufre dolor de espalda por setup ergonómico deficiente")
   - Sección de criterios de compra (qué mirar antes de elegir)
   - Comparativa de productos (tabla + análisis individual)
   - FAQ (mínimo 3 preguntas que la gente busca)
   - Conclusión con CTA claro

4. **Tono conversacional pero autoridad**:
   - Usá "vos" (argentino)
   - Emojis estratégicos (no spam)
   - Datos concretos, no opiniones genéricas
   - Comparaciones técnicas cuando sea relevante

5. **Monetización natural**:
   - Insertá componentes de Amazon (ya los incluyo yo, vos escribí donde van)
   - Mencioná características específicas que justifiquen el precio
   - Disclosure de afiliado al final

**IMPORTANTE:**
- NO inventes especificaciones técnicas
- NO uses frases cliché como "en el vertiginoso mundo de..."
- SÍ usá bullets y tablas para scanneability
- SÍ citá fuentes cuando menciones estudios/estadísticas

**Output format (EXACTO):**

---
title: "[Título SEO-optimizado]"
description: "[Meta description con CTA]"
pubDate: ${today}
heroImage: "/images/default-hero.jpg"
category: "Hardware"
tags: ["tag1", "tag2", "tag3"]
featured: true
---

[Contenido completo del artículo en Markdown]

**RECORDÁ:** El artículo debe ser TAN bueno que la gente lo guarde, lo comparta y HAGA CLIC en los productos porque genuinamente les sirve, no por FOMO.`;

  console.log("📝 Generating article with GPT-4...");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o", // ✅ Upgrade de mini a full (mejor calidad)
    messages: [
      {
        role: "system",
        content:
          "Sos un redactor experto en SEO para blogs de tecnología. Escribís en español argentino (voseo), con tono conversacional pero autoridad. Priorizás datos concretos sobre opiniones genéricas.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 4000,
  });

  let articleContent = completion.choices[0].message.content || "";

  // Fix frontmatter
  articleContent = fixYamlFrontmatter(articleContent);

  // Imagen relevante (Pexels mejorado)
  const imageQuery = keyword.split(" ").slice(0, 3).join(" ");
  const imageUrl = await downloadImageFromPexels(imageQuery);

  const finalContent = articleContent.replaceAll(
    "/images/default-hero.jpg",
    imageUrl
  );

  // Guardar
  const slug = slugify(keyword);
  const filename = `${today}-${slug}.md`;
  const filepath = path.join("src", "content", "blog", filename);

  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, finalContent, "utf-8");

  console.log(`✅ Article saved: ${filename}`);
  console.log(`💰 Estimated cost: $${estimateCost(prompt, articleContent)}`);

  return { filename, keyword, products: products.length };
}

// ===== HELPERS =====
function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function fixYamlFrontmatter(content) {
  // (tu lógica actual está OK)
  return content;
}

async function downloadImageFromPexels(query) {
  // (tu lógica actual está OK, pero podrías mejorarla con scoring por relevancia)
  return "/images/default-hero.jpg";
}

function estimateCost(prompt, output) {
  // GPT-4o pricing: $5/1M input, $15/1M output
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(output.length / 4);
  return ((inputTokens * 5 + outputTokens * 15) / 1_000_000).toFixed(4);
}

// ===== EJECUTAR =====
const keyword =
  process.env.CUSTOM_KEYWORD || "best mechanical keyboards for remote work";

generateArticle(keyword)
  .then((result) => {
    console.log(`\n🎉 SUCCESS!`);
    console.log(`   📄 ${result.filename}`);
    console.log(`   🔑 ${result.keyword}`);
    console.log(`   🛒 ${result.products} products included`);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });

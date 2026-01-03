import "dotenv/config";
import OpenAI from "openai";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

// Importar templates de monetización
import {
  detectTemplate,
  buildPromptWithTemplate,
  validateMonetization,
} from "./monetization-templates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// ===== CONFIGURAR CLOUDINARY =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ===== TRACKING =====
const TRACKING_FILE = path.join(__dirname, "../.article-history.json");

function getPublishedTopics() {
  if (fs.existsSync(TRACKING_FILE)) {
    return JSON.parse(fs.readFileSync(TRACKING_FILE, "utf-8"));
  }
  return { topics: [], categories: {}, lastUpdate: null };
}

function savePublishedTopic(keyword, type, category) {
  const history = getPublishedTopics();

  if (!history.categories) {
    history.categories = {};
  }

  history.topics.push({
    keyword,
    type,
    category,
    date: new Date().toISOString(),
  });
  history.lastUpdate = new Date().toISOString();
  history.categories[category] = (history.categories[category] || 0) + 1;

  if (history.topics.length > 50) {
    history.topics = history.topics.slice(-50);
  }

  fs.writeFileSync(TRACKING_FILE, JSON.stringify(history, null, 2));
}

function isTopicRecent(keyword, daysThreshold = 45) {
  const history = getPublishedTopics();
  const recentTopics = history.topics.filter((t) => {
    const daysSince = (Date.now() - new Date(t.date)) / (1000 * 60 * 60 * 24);
    return daysSince < daysThreshold;
  });

  const normalizedKeyword = keyword.toLowerCase().replace(/[^\w\s]/g, "");
  return recentTopics.some((t) => {
    const normalizedTopic = t.keyword.toLowerCase().replace(/[^\w\s]/g, "");
    const words1 = normalizedKeyword.split(/\s+/);
    const words2 = normalizedTopic.split(/\s+/);
    const overlap = words1.filter((w) => words2.includes(w)).length;
    return overlap / Math.max(words1.length, words2.length) > 0.6;
  });
}

function getCategoryBalance() {
  const history = getPublishedTopics();
  return history.categories || {};
}

// ===== IMPORTAR PRODUCTOS =====
async function loadProducts() {
  try {
    const module = await import("../src/config/products.js");
    return {
      getRelevantProducts: module.getRelevantProducts,
      buildComparisonData: module.buildComparisonData,
    };
  } catch (error) {
    console.warn("Advertencia: No se pudo cargar products.js:", error.message);
    return {
      getRelevantProducts: () => [],
      buildComparisonData: () => [],
    };
  }
}

// ===== CATEGORÍAS =====
const CONTENT_CATEGORIES = {
  ai_tools: {
    weight: 35,
    keywords: [
      "how to use ChatGPT for content creation",
      "Claude vs ChatGPT for coding",
      "AI writing tools comparison 2025",
      "prompt engineering techniques",
      "AI agents for automation",
      "using AI for research and note-taking",
      "AI tools for developers workflow",
      "GitHub Copilot vs Cursor AI",
      "AI for data analysis and visualization",
      "automated testing with AI",
      "AI code review tools",
      "natural language to SQL with AI",
      "AI for debugging and error fixing",
      "training custom AI models basics",
      "AI API integration guide",
    ],
  },
  productivity_systems: {
    weight: 30,
    keywords: [
      "getting things done GTD system",
      "zettelkasten note-taking method",
      "building a second brain tutorial",
      "time blocking vs task batching",
      "pomodoro technique for deep work",
      "para method for organization",
      "atomic habits implementation",
      "energy management strategies",
      "weekly review process setup",
      "morning routine for focus",
      "digital minimalism approach",
      "inbox zero email system",
      "kanban workflow for solo work",
      "eisenhower matrix prioritization",
      "habit stacking techniques",
    ],
  },
  ai_automation: {
    weight: 20,
    keywords: [
      "automating repetitive tasks with AI",
      "Zapier vs Make for AI workflows",
      "building custom GPTs for business",
      "AI email management automation",
      "social media scheduling with AI",
      "document processing automation",
      "AI data entry and extraction",
      "automated reporting with AI",
      "AI customer support setup",
      "workflow automation without code",
      "AI integration with existing tools",
      "batch processing with AI APIs",
      "automated content repurposing",
      "AI calendar management",
      "smart notification filtering",
    ],
  },
  developer_productivity: {
    weight: 10,
    keywords: [
      "terminal productivity tips",
      "VS Code extensions for speed",
      "git workflow optimization",
      "debugging techniques advanced",
      "code review best practices",
      "pair programming remotely",
      "keyboard shortcuts mastery",
      "CLI tools every dev needs",
      "docker development workflow",
      "testing automation strategies",
      "CI/CD pipeline optimization",
      "monitoring and logging setup",
      "API testing tools comparison",
      "refactoring legacy code approach",
      "technical documentation writing",
    ],
  },
  monetized_hardware: {
    weight: 5,
    keywords: [
      "best mechanical keyboards for coding",
      "ergonomic setup for programmers",
      "ultrawide monitors productivity",
      "noise cancelling headphones focus",
      "desk accessories for efficiency",
    ],
  },
};

// ===== SELECCIÓN DE TEMA =====
async function selectSmartTopic() {
  console.log("Seleccionando tema con balance de categorías...\n");

  const categoryBalance = getCategoryBalance();
  const totalArticles = Object.values(categoryBalance).reduce(
    (a, b) => a + b,
    0
  );

  console.log("Balance actual:", categoryBalance);

  const categoryScores = Object.entries(CONTENT_CATEGORIES)
    .map(([cat, config]) => {
      const currentCount = categoryBalance[cat] || 0;
      const expectedRatio = config.weight / 100;
      const currentRatio = totalArticles > 0 ? currentCount / totalArticles : 0;
      const deficit = expectedRatio - currentRatio;
      return { category: cat, deficit, config };
    })
    .sort((a, b) => b.deficit - a.deficit);

  const selectedCategory = categoryScores[0];
  const keywords = [...selectedCategory.config.keywords];
  keywords.sort(() => Math.random() - 0.5);

  let selectedKeyword = null;
  for (const keyword of keywords) {
    if (
      typeof keyword === "string" &&
      keyword.trim() &&
      !isTopicRecent(keyword, 45)
    ) {
      selectedKeyword = keyword;
      break;
    }
  }

  if (!selectedKeyword) {
    const validKeywords = keywords.filter(
      (k) => typeof k === "string" && k.trim()
    );
    selectedKeyword =
      validKeywords[Math.floor(Math.random() * validKeywords.length)];
    console.log("Advertencia: Usando keyword reciente");
  }

  const isMonetized = selectedCategory.category === "monetized_hardware";

  console.log(`Tema seleccionado: ${selectedKeyword}`);
  console.log(`Categoría: ${selectedCategory.category}\n`);

  return {
    keyword: selectedKeyword,
    category: selectedCategory.category,
    isMonetized,
  };
}

// ===== RESEARCH =====
async function researchKeyword(keyword) {
  console.log(`Investigando: ${keyword}`);

  try {
    const response = await axios.post(
      "https://google.serper.dev/search",
      { q: keyword, num: 10, gl: "us", hl: "en" },
      {
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const topResults = response.data.organic || [];
    const competitorInsights = topResults.slice(0, 5).map((r) => ({
      title: r.title,
      snippet: r.snippet,
    }));

    console.log(`Competidores analizados: ${competitorInsights.length}`);
    return { competitorInsights };
  } catch (error) {
    console.warn("Advertencia: Research timeout (continuando)");
    return { competitorInsights: [] };
  }
}

// ===== SISTEMA DE IMÁGENES CON CLOUDINARY =====

function buildSmartImageQuery(keyword, category) {
  const categoryVisuals = {
    ai_tools: "artificial intelligence technology digital",
    productivity_systems: "productivity workspace organized",
    ai_automation: "automation workflow technology",
    developer_productivity: "coding developer workspace",
    monetized_hardware: "tech gadget product",
  };

  const stopWords = ["how", "to", "for", "with", "the", "a", "vs", "and"];

  const keywordTerms = keyword
    .toLowerCase()
    .split(" ")
    .filter((word) => !stopWords.includes(word) && word.length > 2)
    .slice(0, 3)
    .join(" ");

  const baseVisual = categoryVisuals[category] || "technology workspace";

  return `${keywordTerms} ${baseVisual}`;
}

function selectBestPhoto(photos) {
  const scoredPhotos = photos.map((photo) => {
    let score = 0;
    if (photo.width >= 1920) score += 3;
    else if (photo.width >= 1280) score += 2;
    else score += 1;

    const aspectRatio = photo.width / photo.height;
    const ratioDiff = Math.abs(aspectRatio - 16 / 9);
    if (ratioDiff < 0.1) score += 3;
    else if (ratioDiff < 0.3) score += 2;

    return { photo, score };
  });

  scoredPhotos.sort((a, b) => b.score - a.score);
  return scoredPhotos[0].photo;
}

async function uploadToCloudinary(imageBuffer, keyword, category) {
  try {
    const slug = keyword
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join("-");

    const publicId = `blog/${category}/${slug}-${Date.now()}`;

    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBuffer.toString("base64")}`,
      {
        public_id: publicId,
        folder: "blog-images",
        transformation: [
          {
            width: 1920,
            height: 1080,
            crop: "fill",
            gravity: "auto",
            quality: "auto:good",
            fetch_format: "auto",
          },
        ],
        tags: [category, "blog", "auto-generated"],
      }
    );

    console.log(`   Subido a Cloudinary exitosamente`);
    console.log(`   Tamaño: ${(result.bytes / 1024).toFixed(1)} KB`);

    return result.secure_url;
  } catch (error) {
    console.error(`   Error Cloudinary: ${error.message}`);
    throw error;
  }
}

async function downloadAndUploadImage(keyword, category) {
  console.log("Obteniendo imagen...");

  const query = buildSmartImageQuery(keyword, category);
  console.log(`   Query: "${query}"`);

  // Validar que Cloudinary esté configurado
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error("ERROR: CLOUDINARY_CLOUD_NAME no está configurado");
    // Retornar una URL válida de placeholder o null
    return null; // O retornar un placeholder local: "/images/placeholder.jpg"
  }

  try {
    // Intentar Pexels
    if (PEXELS_API_KEY) {
      const response = await axios.get("https://api.pexels.com/v1/search", {
        headers: { Authorization: PEXELS_API_KEY },
        params: {
          query: query,
          per_page: 15,
          orientation: "landscape",
        },
        timeout: 15000,
      });

      if (response.data.photos && response.data.photos.length > 0) {
        const bestPhoto = selectBestPhoto(response.data.photos);

        const imageResponse = await axios.get(bestPhoto.src.large2x, {
          responseType: "arraybuffer",
          timeout: 30000,
        });

        console.log(`   Fuente: Pexels - ${bestPhoto.photographer}`);

        const cloudinaryUrl = await uploadToCloudinary(
          Buffer.from(imageResponse.data),
          keyword,
          category
        );

        return cloudinaryUrl;
      }
    }

    // Fallback: Unsplash
    const unsplashUrl = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(
      query
    )}`;

    const unsplashResponse = await axios.get(unsplashUrl, {
      responseType: "arraybuffer",
      timeout: 20000,
      maxRedirects: 5,
    });

    console.log("   Fuente: Unsplash");

    const cloudinaryUrl = await uploadToCloudinary(
      Buffer.from(unsplashResponse.data),
      keyword,
      category
    );

    return cloudinaryUrl;
  } catch (error) {
    console.error(`   Error obteniendo imagen: ${error.message}`);
    console.error(
      `   CLOUD_NAME configurado: ${process.env.CLOUDINARY_CLOUD_NAME || "NO"}`
    );

    // Retornar null o un placeholder local
    return null; // El componente usará el emoji fallback
  }
}

// ===== GENERAR ARTÍCULO =====
async function generateArticle(keyword, category, isMonetized) {
  const today = new Date().toISOString().split("T")[0];

  console.log("Investigando competencia...");
  const { competitorInsights } = await researchKeyword(keyword);
  const competitorContext =
    competitorInsights.length > 0
      ? competitorInsights
          .map((c, i) => `${i + 1}. ${c.title}\n   ${c.snippet}`)
          .join("\n\n")
      : "No hay competencia directa";

  let template = null;
  let products = [];
  let prompt;

  if (isMonetized) {
    const { getRelevantProducts } = await loadProducts();
    products = getRelevantProducts(keyword, 3);

    if (products.length === 0) {
      isMonetized = false;
    } else {
      template = detectTemplate(keyword);
      prompt = buildPromptWithTemplate(
        keyword,
        template,
        products,
        competitorContext
      );
    }
  }

  if (!isMonetized) {
    prompt = `Sos un experto reconocido en IA y productividad. Escribís en español argentino con voseo natural y auténtico.

**Keyword principal:** "${keyword}"
**Categoría:** ${category}
**Fecha:** ${today}

**Contexto competitivo:**
${competitorContext}

**OBJETIVO:** Crear el artículo MÁS COMPLETO Y PRÁCTICO sobre este tema que existe en español.

## ESTRUCTURA OBLIGATORIA (12 secciones):

1. APERTURA MAGNÉTICA (hook + problema + promesa)
2. ¿QUÉ ES [CONCEPTO]? (definición + por qué ahora + quién lo usa)
3. EL PROBLEMA QUE RESUELVE (3-5 pain points)
4. CÓMO FUNCIONA: FRAMEWORK PASO A PASO (5-8 pasos detallados)
5. IMPLEMENTACIÓN PRÁCTICA (workflow + herramientas + setup)
6. EJEMPLOS REALES Y CASOS DE USO (3-4 escenarios)
7. TÉCNICAS AVANZADAS Y HACKS (5-7 tips)
8. ERRORES FATALES Y CÓMO EVITARLOS (5-6 errores)
9. RECURSOS Y HERRAMIENTAS GRATIS
10. CHECKLIST DE IMPLEMENTACIÓN (8-12 items)
11. FAQ (5-7 preguntas)
12. CONCLUSIÓN + PRÓXIMOS PASOS

**VOSEO ARGENTINO OBLIGATORIO:**
CORRECTO: "Vos podés", "fijate", "asegurate", "probá"
INCORRECTO: NUNCA "tú puedes", "fíjate", "asegúrate"

**FORMATO:**
- Párrafos: 3-4 líneas máx
- Usa 1-2 emojis estratégicos por sección H2 (solo cuando agreguen valor)
- **Negritas** para términos clave
- \`código\` para comandos técnicos
- Code snippets cuando sea técnico

**SEO:**
- Title: 50-60 caracteres + keyword + 2025/2026
- Description: 150-155 caracteres + CTA
- Tags: 4-6 tags relevantes
- H2: Variaciones de keyword en 3-4 headers

**OUTPUT (FORMATO EXACTO - NO MODIFICAR):**
---
title: "Título entre comillas de 50-60 caracteres con keyword"
description: "Descripción entre comillas de 150-155 caracteres con CTA clara"
pubDate: ${today}
heroImage: "/placeholder.jpg"
category: "${getCategoryLabel(category)}"
tags: ["tag1", "tag2", "tag3", "tag4"]
featured: true
readingTime: "10 min"
---

## Primer H2 Aquí

Tu contenido empieza aquí, sin ningún wrapper de markdown...

**VALIDACIONES CRÍTICAS:**
- OBLIGATORIO: El frontmatter DEBE empezar con --- en la primera línea
- OBLIGATORIO: title y description SIEMPRE entre comillas dobles
- PROHIBIDO: NO uses bloques \`\`\`markdown para envolver el contenido
- PROHIBIDO: NO uses comillas simples en valores YAML
- OBLIGATORIO: 2500-3500 palabras
- OBLIGATORIO: 10+ H2 con 200+ palabras cada uno
- OBLIGATORIO: 3+ ejemplos concretos
- OBLIGATORIO: Voseo argentino en TODO el texto
- PROHIBIDO: Sin placeholder text

Priorizá VALOR REAL. El lector debe poder implementar HOY.`;
  }

  console.log("Generando contenido con GPT-4o...");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Sos un redactor experto en IA y productividad. Español argentino REAL con voseo auténtico.

Reglas NUNCA violadas:
- NUNCA "tú", "fíjate", "asegúrate"
- NUNCA bloques markdown para MDX
- SIEMPRE 12 secciones completas
- NUNCA placeholder text
- NUNCA formato incorrecto en frontmatter YAML
- Title y description SIEMPRE entre comillas dobles

Misión: Artículos que la gente GUARDE y COMPARTA.`,
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.75,
    max_tokens: 5000,
  });

  let articleContent = completion.choices[0].message.content || "";

  articleContent = cleanMarkdownWrapper(articleContent);
  articleContent = fixYamlFrontmatter(articleContent);
  articleContent = enhanceArticleContent(articleContent);

  if (isMonetized && template) {
    const validation = validateMonetization(articleContent, template);
    if (!validation.valid) {
      console.warn("Advertencia: Errores de monetización detectados");
    }
  }

  // Obtener imagen y subir a Cloudinary
  const imageUrl = await downloadAndUploadImage(keyword, category);

  // Si no hay imagen, usar null para que el componente muestre el fallback
  const finalContent = imageUrl
    ? articleContent.replace(
        /heroImage:\s*["'].*?["']/,
        `heroImage: "${imageUrl}"`
      )
    : articleContent.replace(/heroImage:\s*["'].*?["']/, `heroImage: null`);

  // Guardar artículo
  const slug = slugify(keyword);
  const filename = `${today}-${slug}.mdx`;
  const filepath = path.join("src", "content", "blog", filename);

  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, finalContent, "utf-8");

  savePublishedTopic(keyword, isMonetized ? "monetized" : "value", category);

  console.log(`\nArtículo guardado: ${filename}`);
  console.log(`Costo estimado: $${estimateCost(prompt, articleContent)}`);

  return {
    filename,
    keyword,
    category,
    monetized: isMonetized,
    imageUrl,
    slug,
  };
}

// ===== HELPERS =====
function getCategoryLabel(category) {
  const labels = {
    ai_tools: "IA",
    productivity_systems: "Productividad",
    ai_automation: "Automatización",
    developer_productivity: "Desarrollo",
    monetized_hardware: "Hardware",
  };
  return labels[category] || "Productividad";
}

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cleanMarkdownWrapper(content) {
  content = content.replace(/^```(?:markdown|md)?\s*\n/i, "");
  content = content.replace(/\n```\s*$/, "");
  return content.trim();
}

function fixYamlFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.error("ERROR: No se encontró frontmatter válido");
    return content;
  }

  let frontmatter = frontmatterMatch[1];
  const bodyContent = content.replace(/^---\n[\s\S]*?\n---/, "");

  // Parsear línea por línea para evitar corrupción
  const lines = frontmatter.split("\n");
  const fixedLines = lines.map((line) => {
    // Si es una línea de array (tags), dejarla como está
    if (line.trim().startsWith("-")) return line;

    // Si es una propiedad: valor
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (!match) return line;

    const [, key, value] = match;
    const trimmed = value.trim();

    // Si ya tiene comillas dobles, dejar como está
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return line;
    }

    // Si es un array o booleano, dejar como está
    if (trimmed.startsWith("[") || trimmed === "true" || trimmed === "false") {
      return line;
    }

    // Agregar comillas dobles a strings
    const cleaned = trimmed.replace(/^['"]|['"]$/g, "");
    const escaped = cleaned.replace(/"/g, '\\"');
    return `${key}: "${escaped}"`;
  });

  const fixedFrontmatter = fixedLines.join("\n");

  // Validar que existan los campos requeridos
  if (!fixedFrontmatter.includes("title:")) {
    console.error('ERROR CRÍTICO: Falta campo "title" en frontmatter');
  }
  if (!fixedFrontmatter.includes("description:")) {
    console.error('ERROR CRÍTICO: Falta campo "description" en frontmatter');
  }

  return `---\n${fixedFrontmatter}\n---${bodyContent}`;
}

function enhanceArticleContent(content) {
  console.log("\nValidando contenido generado...");

  // Validar que existe frontmatter
  const hasFrontmatter = content.match(/^---\n[\s\S]*?\n---/);
  if (!hasFrontmatter) {
    console.error("ERROR: No se detectó frontmatter YAML");
    return content;
  }

  // Validar campos requeridos
  const frontmatter = hasFrontmatter[0];
  const hasTitle = /^title:\s*["'].+["']/m.test(frontmatter);
  const hasDescription = /^description:\s*["'].+["']/m.test(frontmatter);

  if (!hasTitle) {
    console.error("ERROR: Falta campo 'title' en frontmatter");
  } else {
    console.log("OK: Campo 'title' presente");
  }

  if (!hasDescription) {
    console.error("ERROR: Falta campo 'description' en frontmatter");
  } else {
    console.log("OK: Campo 'description' presente");
  }

  const h2Count = (content.match(/^## /gm) || []).length;
  const wordCount = content.split(/\s+/).length;

  if (h2Count < 8)
    console.warn(`Advertencia: Solo ${h2Count} H2 (esperado: 10+)`);
  else console.log(`OK: ${h2Count} H2`);

  if (wordCount < 2000)
    console.warn(`Advertencia: Solo ${wordCount} palabras (esperado: 2500+)`);
  else console.log(`OK: ~${wordCount} palabras`);

  const tuteoErrors = [];
  if (content.includes("tú puedes")) tuteoErrors.push('"tú puedes"');
  if (content.includes("fíjate")) tuteoErrors.push('"fíjate"');
  if (content.includes("asegúrate")) tuteoErrors.push('"asegúrate"');

  if (tuteoErrors.length > 0) {
    console.error(`\nERROR: TUTEO DETECTADO: ${tuteoErrors.join(", ")}`);
  } else {
    console.log("OK: Voseo correcto");
  }

  return content;
}

function estimateCost(prompt, output) {
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(output.length / 4);
  return ((inputTokens * 2.5 + outputTokens * 10) / 1_000_000).toFixed(4);
}

// ===== EJECUTAR =====
async function main() {
  try {
    console.log("=== Generador de Artículos con Cloudinary ===\n");

    const { keyword, category, isMonetized } = await selectSmartTopic();
    const result = await generateArticle(keyword, category, isMonetized);

    console.log(`\n=== GENERACIÓN EXITOSA ===`);
    console.log(`Archivo: ${result.filename}`);
    console.log(`Keyword: ${result.keyword}`);
    console.log(`Imagen: ${result.imageUrl}`);
    console.log(`Tipo: ${result.monetized ? "Monetizado" : "Educativo"}`);
  } catch (error) {
    console.error("ERROR FATAL:", error.message);
    process.exit(1);
  }
}

main();

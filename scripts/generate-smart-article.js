import "dotenv/config";
import OpenAI from "openai";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
// Función para importar productos dinámicamente
async function loadProducts() {
  try {
    const module = await import("../src/config/products.js");
    return {
      getRelevantProducts: module.getRelevantProducts,
      buildComparisonData: module.buildComparisonData,
    };
  } catch (error) {
    console.warn("⚠️ No se pudo cargar products.js:", error.message);
    return {
      getRelevantProducts: () => [],
      buildComparisonData: () => [],
    };
  }
}

// ===== CATEGORÍAS CON KEYWORDS COMPLETOS =====
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
  console.log("🎯 Seleccionando tema con balance de categorías...\n");

  const categoryBalance = getCategoryBalance();
  const totalArticles = Object.values(categoryBalance).reduce(
    (a, b) => a + b,
    0
  );

  console.log("📊 Balance actual:", categoryBalance);

  const categoryScores = Object.entries(CONTENT_CATEGORIES)
    .map(([cat, config]) => {
      const currentCount = categoryBalance[cat] || 0;
      const expectedRatio = config.weight / 100;
      const currentRatio = totalArticles > 0 ? currentCount / totalArticles : 0;
      const deficit = expectedRatio - currentRatio;

      return { category: cat, deficit, config };
    })
    .sort((a, b) => b.deficit - a.deficit);

  console.log("🎲 Categoría seleccionada:", categoryScores[0].category);

  const selectedCategory = categoryScores[0];
  const keywords = [...selectedCategory.config.keywords];

  if (!keywords || keywords.length === 0) {
    throw new Error(
      `❌ No hay keywords definidos para: ${selectedCategory.category}`
    );
  }

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

    if (validKeywords.length === 0) {
      throw new Error(
        `❌ No hay keywords válidos en: ${selectedCategory.category}`
      );
    }

    selectedKeyword =
      validKeywords[Math.floor(Math.random() * validKeywords.length)];
    console.log("⚠️ Usando keyword reciente (todas usadas recientemente)");
  }

  const isMonetized = selectedCategory.category === "monetized_hardware";

  console.log(`✅ Tema: ${selectedKeyword}`);
  console.log(`   Categoría: ${selectedCategory.category}`);
  console.log(`   Monetizado: ${isMonetized ? "Sí (1 de cada 20)" : "No"}\n`);

  return {
    keyword: selectedKeyword,
    category: selectedCategory.category,
    isMonetized,
  };
}

// ===== RESEARCH =====
async function researchKeyword(keyword) {
  console.log(`🔍 Researching: ${keyword}`);

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

    console.log(`✅ ${competitorInsights.length} competidores analizados`);
    return { competitorInsights };
  } catch (error) {
    console.warn("⚠️ Research timeout/error (continuando sin contexto)");
    return { competitorInsights: [] };
  }
}

// ===== IMAGEN =====
async function downloadImageFromPexels(query) {
  if (!PEXELS_API_KEY) return "/images/default-hero.jpg";

  try {
    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: { Authorization: PEXELS_API_KEY },
      params: { query, per_page: 5, orientation: "landscape" },
      timeout: 15000,
    });

    if (!response.data.photos?.length) return "/images/default-hero.jpg";

    const photo = response.data.photos[0];
    const imageResponse = await axios.get(photo.src.large2x, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const filename = `hero-${Date.now()}.jpg`;
    const filepath = path.join("public", "images", filename);

    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, imageResponse.data);

    return `/images/${filename}`;
  } catch (error) {
    return "/images/default-hero.jpg";
  }
}

// ===== GENERAR ARTÍCULO =====
async function generateArticle(keyword, category, isMonetized) {
  const today = new Date().toISOString().split("T")[0];

  console.log("🔍 Investigando competencia...");
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
      console.warn(
        "⚠️ No hay productos para este keyword, generando educativo"
      );
      isMonetized = false;
    } else {
      template = detectTemplate(keyword);
      console.log(`📋 Template: ${template}`);
      console.log(`🛒 Productos: ${products.length}`);

      prompt = buildPromptWithTemplate(
        keyword,
        template,
        products,
        competitorContext
      );
    }
  }

  // Prompt educativo (fallback o por defecto)
  if (!isMonetized) {
    prompt = `Sos un experto en IA y productividad. Escribís en español argentino con voseo natural.

**Keyword:** "${keyword}"
**Categoría:** ${category}

**Competencia:**
${competitorContext}

Escribí un artículo 100% EDUCATIVO Y TÁCTICO en formato MDX para Astro.

IMPORTANTE: NO uses bloques de código markdown (\`\`\`markdown). Escribí directamente el contenido MDX sin ningún wrapper.

Estructura:
1. Hook: Problema + impacto real
2. Explicación del concepto/técnica
3. Framework/Sistema paso a paso (muy detallado)
4. Ejemplos concretos con código/workflows/screenshots mentales
5. Tips avanzados poco conocidos
6. Errores comunes y cómo evitarlos
7. Checklist de implementación
8. Recursos gratuitos (apps, docs, communities)

NO menciones productos para comprar.
NO links de afiliados.
100% valor educativo.

**Tono:**
- Voseo argentino: "vos tenés", "fijate", "podés"
- Conversacional pero profesional
- Emojis moderados (2-3 por sección)
- Párrafos cortos (2-3 líneas máx)

**SEO:**
- Title: 50-60 caracteres
- Meta: 150-155 con CTA
- 4+ H2 con variaciones de keyword

**FORMATO DE OUTPUT - ESCRIBE EXACTAMENTE ASÍ (sin bloques de código):**

---
title: "[Título SEO]"
description: "[Meta description]"
pubDate: ${today}
heroImage: "/images/default-hero.jpg"
category: "${getCategoryLabel(category)}"
tags: ["tag1", "tag2", "tag3"]
featured: true
readingTime: "X min"
---

## [Título de sección]

[Contenido en Markdown...]

## [Siguiente sección]

[Más contenido...]

RECUERDA: Escribe el contenido directamente, SIN envolverlo en \`\`\`markdown o cualquier otro bloque de código.`;
  }

  console.log("📝 Generando artículo con GPT-4o...");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Sos un redactor experto en IA y productividad. Escribís en español argentino con voseo. Priorizás valor educativo sobre venta. NUNCA uses bloques de código markdown para envolver el contenido MDX. Escribís el contenido directamente.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 4500,
  });

  let articleContent = completion.choices[0].message.content || "";

  // NUEVO: Limpiar bloques de código markdown si GPT-4o los agrega
  articleContent = cleanMarkdownWrapper(articleContent);

  articleContent = fixYamlFrontmatter(articleContent);

  // Validar monetización
  if (isMonetized && template) {
    console.log("✅ Validando componentes de monetización...");
    const validation = validateMonetization(articleContent, template);
    if (!validation.valid) {
      console.warn("⚠️ Errores de validación:");
      validation.errors.forEach((err) => console.warn(`   ${err}`));
      console.warn("   Continuando de todas formas...");
    } else {
      console.log("✅ Monetización correcta");
    }
  }

  // Imagen
  const imageQuery = keyword.split(" ").slice(0, 3).join(" ");
  const imageUrl = await downloadImageFromPexels(imageQuery);

  const finalContent = articleContent.replace(
    /heroImage:\s*["']\/images\/default-hero\.jpg["']/,
    `heroImage: "${imageUrl}"`
  );

  // Guardar
  const slug = slugify(keyword);
  const filename = `${today}-${slug}.mdx`;
  const filepath = path.join("src", "content", "blog", filename);

  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, finalContent, "utf-8");

  savePublishedTopic(keyword, isMonetized ? "monetized" : "value", category);

  console.log(`✅ Artículo guardado: ${filename}`);
  console.log(`💰 Costo: $${estimateCost(prompt, articleContent)}`);

  return {
    filename,
    keyword,
    category,
    template: template || "educational",
    products: products.length,
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

// NUEVA FUNCIÓN: Limpia bloques de código markdown
function cleanMarkdownWrapper(content) {
  // Elimina ```markdown al inicio y ``` al final
  content = content.replace(/^```markdown\s*\n/i, "");
  content = content.replace(/^```md\s*\n/i, "");
  content = content.replace(/\n```\s*$/, "");

  // Elimina ``` solitarios al inicio o final
  content = content.replace(/^```\s*\n/, "");
  content = content.replace(/\n```\s*$/, "");

  return content.trim();
}

function fixYamlFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return content;

  let frontmatter = frontmatterMatch[1];
  const bodyContent = content.replace(/^---\n[\s\S]*?\n---/, "");

  frontmatter = frontmatter.replace(/'/g, '"');
  frontmatter = frontmatter.replace(
    /^(title|description|heroImage|category|readingTime):\s*(.+)$/gm,
    (match, key, value) => {
      const trimmed = value.trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) return match;
      const clean = trimmed.replace(/^['"]|['"]$/g, "");
      const escaped = clean.replace(/"/g, '\\"');
      return `${key}: "${escaped}"`;
    }
  );

  return `---\n${frontmatter}\n---${bodyContent}`;
}

function estimateCost(prompt, output) {
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(output.length / 4);
  return ((inputTokens * 2.5 + outputTokens * 10) / 1_000_000).toFixed(4);
}

// ===== EJECUTAR =====
async function main() {
  try {
    const { keyword, category, isMonetized } = await selectSmartTopic();
    const result = await generateArticle(keyword, category, isMonetized);

    console.log(`\n🎉 ÉXITO!`);
    console.log(`   📄 ${result.filename}`);
    console.log(`   🔑 ${result.keyword}`);
    console.log(`   📂 ${result.category}`);
    console.log(`   💰 Monetizado: ${result.monetized ? "Sí" : "No"}`);
    console.log(`   🖼️  ${result.imageUrl}`);

    if (result.monetized) {
      console.log(`   📋 Template: ${result.template}`);
      console.log(`   🛒 Productos incluidos: ${result.products}`);
      console.log(`\n   💡 Artículo monetizado (1 de cada 20)`);
    } else {
      console.log(`\n   ℹ️  Artículo educativo (19 de cada 20)`);
    }
  } catch (error) {
    console.error("❌ Error fatal:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

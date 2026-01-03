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

// ===== SISTEMA MEJORADO DE IMÁGENES =====

// Caché de imágenes
const imageCache = new Map();

function buildSmartImageQuery(keyword, category) {
  const categoryVisuals = {
    ai_tools: "artificial intelligence technology digital futuristic",
    productivity_systems: "productivity workspace organized minimal",
    ai_automation: "automation workflow technology modern",
    developer_productivity: "coding developer workspace programming",
    monetized_hardware: "tech gadget product modern",
  };

  const stopWords = [
    "how",
    "to",
    "for",
    "with",
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "from",
    "vs",
    "comparison",
  ];

  const keywordTerms = keyword
    .toLowerCase()
    .split(" ")
    .filter((word) => !stopWords.includes(word) && word.length > 2)
    .slice(0, 3)
    .join(" ");

  const baseVisual = categoryVisuals[category] || "technology workspace modern";

  return `${keywordTerms} ${baseVisual}`;
}

function selectBestPhoto(photos) {
  const scoredPhotos = photos.map((photo) => {
    let score = 0;

    // Bonus por resolución
    if (photo.width >= 1920) score += 3;
    else if (photo.width >= 1280) score += 2;
    else score += 1;

    // Bonus por aspect ratio ideal
    const aspectRatio = photo.width / photo.height;
    const idealRatio = 16 / 9;
    const ratioDiff = Math.abs(aspectRatio - idealRatio);
    if (ratioDiff < 0.1) score += 3;
    else if (ratioDiff < 0.3) score += 2;
    else score += 1;

    // Bonus por colores no muy oscuros
    if (photo.avg_color) {
      const hex = photo.avg_color.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      if (brightness > 100) score += 2;
      else if (brightness > 50) score += 1;
    }

    return { photo, score };
  });

  scoredPhotos.sort((a, b) => b.score - a.score);
  return scoredPhotos[0].photo;
}

function generateImageFilename(query) {
  const timestamp = Date.now();
  const slug = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join("-");

  return `hero-${slug}-${timestamp}.jpg`;
}

function validateImage(filepath) {
  try {
    const stats = fs.statSync(filepath);

    if (stats.size < 10000) {
      console.warn("   ⚠️ Imagen demasiado pequeña");
      return false;
    }

    const buffer = fs.readFileSync(filepath);
    const isJPEG = buffer[0] === 0xff && buffer[1] === 0xd8;
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;

    if (!isJPEG && !isPNG) {
      console.warn("   ⚠️ Formato de imagen inválido");
      return false;
    }

    return true;
  } catch (error) {
    console.error("   ❌ Error validando imagen:", error.message);
    return false;
  }
}

function getCategoryPlaceholder(category) {
  const placeholders = {
    ai_tools: "/images/placeholder-ai-tools.jpg",
    productivity_systems: "/images/placeholder-productivity.jpg",
    ai_automation: "/images/placeholder-automation.jpg",
    developer_productivity: "/images/placeholder-dev.jpg",
    monetized_hardware: "/images/placeholder-hardware.jpg",
  };

  return placeholders[category] || "/images/default-hero.jpg";
}

async function tryPexels(query) {
  try {
    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: { Authorization: PEXELS_API_KEY },
      params: {
        query: query,
        per_page: 15,
        orientation: "landscape",
        size: "large",
      },
      timeout: 15000,
    });

    if (!response.data.photos || response.data.photos.length === 0) {
      return null;
    }

    const bestPhoto = selectBestPhoto(response.data.photos);

    const imageResponse = await axios.get(bestPhoto.src.large2x, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const filename = generateImageFilename(query);
    const filepath = path.join("public", "images", filename);

    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, imageResponse.data);

    console.log(`   📸 Imagen guardada: ${filename}`);
    console.log(`   👤 Fotógrafo: ${bestPhoto.photographer}`);

    return `/images/${filename}`;
  } catch (error) {
    console.warn(`   ⚠️ Pexels falló: ${error.message}`);
    return null;
  }
}

async function tryUnsplashSource(query) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const imageUrl = `https://source.unsplash.com/1920x1080/?${encodedQuery}`;

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 20000,
      maxRedirects: 5,
    });

    const filename = generateImageFilename(query);
    const filepath = path.join("public", "images", filename);

    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, response.data);

    console.log(`   📸 Imagen guardada desde Unsplash: ${filename}`);

    return `/images/${filename}`;
  } catch (error) {
    console.warn(`   ⚠️ Unsplash falló: ${error.message}`);
    return null;
  }
}

async function downloadImageWithFallback(keyword, category) {
  console.log("🖼️  Buscando imagen perfecta para el artículo...");

  const query = buildSmartImageQuery(keyword, category);
  console.log(`   Query de búsqueda: "${query}"`);

  // Intentar Pexels primero
  if (PEXELS_API_KEY) {
    const pexelsResult = await tryPexels(query);
    if (pexelsResult) {
      console.log("✅ Imagen obtenida de Pexels");
      return pexelsResult;
    }
  }

  // Fallback a Unsplash
  const unsplashResult = await tryUnsplashSource(query);
  if (unsplashResult) {
    console.log("✅ Imagen obtenida de Unsplash");
    return unsplashResult;
  }

  // Si todo falla, usar placeholder
  console.log("⚠️ Usando imagen por defecto");
  return getCategoryPlaceholder(category);
}

async function downloadImageFromPexels(keyword, category) {
  try {
    // Verificar caché
    if (imageCache.has(keyword)) {
      console.log("   💾 Usando imagen desde caché");
      return imageCache.get(keyword);
    }

    const imageUrl = await downloadImageWithFallback(keyword, category);

    // Validar si se descargó nueva imagen
    if (imageUrl.startsWith("/images/hero-")) {
      const filepath = path.join("public", imageUrl);
      const isValid = validateImage(filepath);

      if (!isValid) {
        console.warn("   ⚠️ Imagen inválida, usando placeholder");
        return getCategoryPlaceholder(category);
      }
    }

    // Guardar en caché
    imageCache.set(keyword, imageUrl);

    return imageUrl;
  } catch (error) {
    console.error("   ❌ Error en sistema de imágenes:", error.message);
    return getCategoryPlaceholder(category);
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

  // PROMPT EDUCATIVO MEJORADO
  if (!isMonetized) {
    prompt = `Sos un experto reconocido en IA y productividad. Escribís en español argentino con voseo natural y auténtico.

**Keyword principal:** "${keyword}"
**Categoría:** ${category}
**Fecha:** ${today}

**Contexto competitivo:**
${competitorContext}

**OBJETIVO:** Crear el artículo MÁS COMPLETO Y PRÁCTICO sobre este tema que existe en español.

## ESTRUCTURA OBLIGATORIA (usa TODAS estas secciones en orden):

### 1. APERTURA MAGNÉTICA
- Hook con estadística impactante o historia real
- Problema específico que el lector experimenta HOY
- Promesa clara: "En este artículo vas a aprender..."
- 2-3 párrafos máximo

### 2. ¿QUÉ ES [CONCEPTO]? (Fundamentos)
- Definición clara sin jerga innecesaria
- Por qué importa AHORA (tendencias 2025-2026)
- Quién debería usarlo (y quién no)
- Ejemplo visual o analogía memorable

### 3. EL PROBLEMA QUE RESUELVE
- 3-5 pain points específicos con bullet points
- Impacto cuantificado cuando es posible
- Casos de uso reales
- Contraste: Sin esto vs Con esto

### 4. CÓMO FUNCIONA: FRAMEWORK PASO A PASO
Sistema detallado con 5-8 pasos numerados. Cada paso DEBE tener:
- Título descriptivo
- Explicación de 2-3 párrafos
- Ejemplo concreto
- Tips de implementación
- Code snippets si es técnico

### 5. IMPLEMENTACIÓN PRÁCTICA
- Workflow completo de principio a fin
- Herramientas específicas (con nombres reales)
- Configuración paso a paso
- Tiempo estimado de setup
- Recursos necesarios

### 6. EJEMPLOS REALES Y CASOS DE USO
- 3-4 escenarios diferentes
- Antes/Después con métricas
- Errores comunes de cada escenario
- "Si te pasa X, hacé Y"

### 7. TÉCNICAS AVANZADAS Y HACKS
- 5-7 tips que el 90% de la gente no conoce
- Shortcuts y atajos
- Optimizaciones de rendimiento
- Integraciones con otras herramientas

### 8. ERRORES FATALES Y CÓMO EVITARLOS
Lista de 5-6 errores comunes:
- ❌ Error específico
- Por qué sucede
- Cómo detectarlo
- ✅ Solución específica

### 9. RECURSOS Y HERRAMIENTAS GRATIS
- Apps y servicios (mencionar nombres conocidos)
- Documentación oficial
- Comunidades y foros
- Templates o boilerplates
- Cursos gratuitos si existen

### 10. CHECKLIST DE IMPLEMENTACIÓN
Lista verificable de 8-12 items:
- [ ] Paso 1 accionable y específico
- [ ] Paso 2 accionable y específico
- [ ] etc...
Orden lógico de ejecución.

### 11. PREGUNTAS FRECUENTES (FAQ)
5-7 preguntas reales con formato:
**¿Pregunta específica?**
Respuesta de 2-3 párrafos con ejemplos.

### 12. CONCLUSIÓN + PRÓXIMOS PASOS
- Resumen de los 3 puntos más importantes
- Call to action específico
- Qué hacer HOY para empezar
- Invitación a comentar/compartir experiencias

---

## ESTILO DE ESCRITURA OBLIGATORIO:

**VOSEO ARGENTINO (CRÍTICO):**
✅ CORRECTO: "Vos podés configurarlo", "Fijate cómo funciona", "Asegurate de hacer backup", "Si tenés dudas, probá esto"
❌ INCORRECTO: "Tú puedes", "Fíjate", "Asegúrate", "Si tienes dudas"

**TONO:**
- Conversacional como hablar con un colega experto
- Directo y sin fluff innecesario
- Empático con las dificultades del lector
- Optimista sobre los resultados

**PÁRRAFOS:**
- Máximo 3-4 líneas por párrafo
- Una idea principal por párrafo
- Ocasionalmente párrafos de una sola línea para énfasis

**EMOJIS (uso moderado):**
- 2-3 por sección H2
- Usar con propósito: ✅ ❌ 💡 🚀 ⚡ 🎯 📊 🔥
- NO overload de emojis

**FORMATEO:**
- **Negritas** para términos clave (5-8 por sección)
- \`código\` para comandos, variables, nombres técnicos
- Listas con • o - (no mezclar estilos)
- Tablas cuando sea apropiado para comparaciones
- Blockquotes (>) para consejos MUY importantes

**CODE SNIPPETS (cuando sea relevante):**
\`\`\`javascript
// Ejemplo con 5-15 líneas
// Comentarios en español
const ejemplo = "código funcional";
\`\`\`
Explicar qué hace el código antes y después.

---

## SEO Y METADATOS (CRÍTICO):

**Title:**
- Entre 50-60 caracteres EXACTOS (ni más ni menos)
- Incluir keyword principal
- Agregar número si es apropiado: "7 Técnicas..."
- Incluir año: 2025 o 2026
- Power words: Guía, Completa, Definitiva, Práctica, Tutorial

**Description:**
- Entre 150-155 caracteres EXACTOS
- Incluir keyword principal
- Mencionar beneficio específico
- Call to action al final
- Crear urgencia o curiosidad

**Tags:**
- Exactamente 4-6 tags relevantes
- Mix de tags generales y específicos
- Incluir variaciones de la keyword
- Formato: lowercase con guiones ("ia-generativa", "productividad-2025")

**H2 Headers (importante para SEO):**
- Incluir variaciones de keyword en 3-4 H2 diferentes
- Usar long-tail keywords naturalmente
- 1-2 headers en formato de pregunta
- NO hacer keyword stuffing

---

## FORMATO DE OUTPUT EXACTO:

IMPORTANTE: Escribe el contenido MDX directamente. NO lo envuelvas en bloques de código markdown (\`\`\`markdown).

---
title: "Tu título aquí de 50-60 caracteres"
description: "Tu descripción de 150-155 caracteres con CTA"
pubDate: ${today}
heroImage: "/images/default-hero.jpg"
category: "${getCategoryLabel(category)}"
tags: ["tag1", "tag2", "tag3", "tag4"]
featured: true
readingTime: "10 min"
---

## [Título H2 descriptivo con keyword]

Primer párrafo del artículo...

Segundo párrafo...

### Subsección si es necesaria

Más contenido...

## [Segundo H2]

Contenido de la segunda sección...

---

## VALIDACIONES ANTES DE ENTREGAR:

Verificá que tu artículo cumpla con:
- ✅ Longitud total: 2500-3500 palabras
- ✅ Todos los H2 tienen contenido sustancial (mínimo 200 palabras cada uno)
- ✅ Al menos 3 ejemplos concretos con detalles
- ✅ Mínimo 1 lista por cada 300 palabras
- ✅ Code snippets o comandos cuando el tema sea técnico
- ✅ Referencias a otros artículos relacionados (sin URLs, solo menciones)
- ✅ Valor inmediato: el lector puede implementar algo HOY
- ✅ Sin promoción de productos (100% educativo)
- ✅ Sin placeholder text tipo [AQUÍ VA...] o [COMPLETAR...]
- ✅ Frontmatter YAML sin negritas ni formato especial
- ✅ ReadingTime estimado correctamente (1 min por cada 200 palabras)
- ✅ Voseo argentino en TODO el texto
- ✅ Las 12 secciones estructurales están completas

**MISIÓN:** Este artículo debe ser TAN BUENO que el lector:
1. Lo guarde en sus marcadores
2. Lo comparta con colegas
3. Vuelva a tu blog por más contenido
4. Implemente lo que aprendió HOY MISMO

Priorizá VALOR REAL sobre volumen de palabras. Cada párrafo debe aportar algo útil.`;
  }

  console.log("📝 Generando artículo con GPT-4o...");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Sos un redactor experto reconocido en IA y productividad. Escribís en español argentino REAL con voseo auténtico (vos tenés, fijate, podés, asegurate).

Tus artículos son los MÁS COMPLETOS en español sobre cada tema. Priorizás VALOR PRÁCTICO sobre todo.

Reglas estrictas que NUNCA violás:
- NUNCA uses "tú", "tu", "fíjate", "asegúrate" - solo voseo argentino
- NUNCA uses bloques de código markdown para envolver el contenido MDX
- SIEMPRE incluís las 12 secciones estructurales completas
- SIEMPRE das ejemplos concretos y accionables
- NUNCA dejas placeholder text o secciones incompletas
- NUNCA usas formato especial (negritas, código) en el frontmatter YAML
- NUNCA haces keyword stuffing

Tu misión: Crear artículos que la gente GUARDE, COMPARTA e IMPLEMENTE.`,
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.75,
    max_tokens: 5000,
  });

  let articleContent = completion.choices[0].message.content || "";

  // Limpiar y validar
  articleContent = cleanMarkdownWrapper(articleContent);
  articleContent = fixYamlFrontmatter(articleContent);
  articleContent = enhanceArticleContent(articleContent);

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

  // Obtener imagen con el sistema mejorado
  const imageUrl = await downloadImageFromPexels(keyword, category);

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
  console.log(`💰 Costo estimado: ${estimateCost(prompt, articleContent)}`);

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

function cleanMarkdownWrapper(content) {
  content = content.replace(/^```(?:markdown|md)?\s*\n/i, "");
  content = content.replace(/\n```\s*$/, "");
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

function enhanceArticleContent(content) {
  console.log("\n🔍 Validando calidad del artículo...");

  const h2Count = (content.match(/^## /gm) || []).length;
  if (h2Count < 8) {
    console.warn(`⚠️ Solo ${h2Count} secciones H2 (mínimo recomendado: 10)`);
  } else {
    console.log(`✅ Secciones H2: ${h2Count}`);
  }

  const wordCount = content.split(/\s+/).length;
  if (wordCount < 2000) {
    console.warn(`⚠️ Solo ~${wordCount} palabras (mínimo recomendado: 2500)`);
  } else {
    console.log(`✅ Palabras: ~${wordCount}`);
  }

  const tuteoErrors = [];
  if (content.includes("tú puedes") || content.includes("tu puedes")) {
    tuteoErrors.push('Encontrado: "tú puedes" (debe ser "vos podés")');
  }
  if (content.includes("fíjate") || content.includes("Fíjate")) {
    tuteoErrors.push('Encontrado: "fíjate" (debe ser "fijate")');
  }
  if (content.includes("asegúrate") || content.includes("Asegúrate")) {
    tuteoErrors.push('Encontrado: "asegúrate" (debe ser "asegurate")');
  }

  if (tuteoErrors.length > 0) {
    console.error("\n❌ ERRORES DE VOSEO DETECTADOS:");
    tuteoErrors.forEach((err) => console.error(`   ${err}`));
    console.error("   ⚠️ El artículo necesita corrección manual\n");
  } else {
    console.log("✅ Voseo argentino correcto");
  }

  const listsCount = (content.match(/^[\-\*]\s/gm) || []).length;
  const expectedLists = Math.floor(wordCount / 300);
  if (listsCount < expectedLists) {
    console.warn(
      `⚠️ Solo ${listsCount} items de lista (recomendado: ~${expectedLists})`
    );
  } else {
    console.log(`✅ Listas: ${listsCount} items`);
  }

  const codeBlocks = (content.match(/```/g) || []).length / 2;
  console.log(`📝 Code blocks: ${codeBlocks}`);

  console.log("");
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
    console.log("🚀 Generador de Artículos con IA - Versión Mejorada\n");

    const { keyword, category, isMonetized } = await selectSmartTopic();
    const result = await generateArticle(keyword, category, isMonetized);

    console.log(`\n🎉 ARTÍCULO GENERADO EXITOSAMENTE!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📄 Archivo: ${result.filename}`);
    console.log(`🔑 Keyword: ${result.keyword}`);
    console.log(`📂 Categoría: ${result.category}`);
    console.log(`💰 Monetizado: ${result.monetized ? "Sí" : "No"}`);
    console.log(`🖼️  Imagen: ${result.imageUrl}`);

    if (result.monetized) {
      console.log(`📋 Template: ${result.template}`);
      console.log(`🛒 Productos incluidos: ${result.products}`);
      console.log(`\n💡 Artículo monetizado (1 de cada 20)`);
    } else {
      console.log(`\nℹ️  Artículo educativo (19 de cada 20)`);
    }

    console.log(`\n✨ Próximo paso: Revisar y publicar el artículo`);
  } catch (error) {
    console.error("❌ Error fatal:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

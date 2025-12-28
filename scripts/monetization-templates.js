// scripts/monetization-templates.js
/**
 * Templates de artículos "affiliate-first" con monetización integrada
 * Cada template define:
 * - Estructura del artículo
 * - Posiciones de CTAs
 * - Bloques de productos
 * - Disclaimers
 */

export const ARTICLE_TEMPLATES = {
  /**
   * TEMPLATE 1: COMPARISON (vs, mejor, comparación)
   * Ejemplo: "Claude vs ChatGPT", "Mejores teclados mecánicos"
   */
  comparison: {
    name: "Comparación de Productos",
    structure: [
      {
        section: "intro",
        content: "Hook con problema + por qué importa esta comparación",
        monetization: null,
      },
      {
        section: "quick-answer",
        content: "TL;DR: Ganador + por qué (tabla comparativa)",
        monetization: {
          type: "comparison-table",
          products: 3, // Top 3 productos
          component: "ComparisonTable",
        },
      },
      {
        section: "methodology",
        content: "Cómo probamos / criterios de evaluación",
        monetization: null,
      },
      {
        section: "detailed-reviews",
        content: "Review detallada de cada producto (H2 por producto)",
        monetization: {
          type: "product-block",
          placement: "after-each-product", // Bloque de Amazon después de cada review
          component: "AmazonAffiliate",
        },
      },
      {
        section: "comparison-matrix",
        content: "Tabla detallada: specs, precio, pros/cons",
        monetization: null,
      },
      {
        section: "buying-guide",
        content: "Cómo elegir + qué considerar según tu caso",
        monetization: null,
      },
      {
        section: "faq",
        content: "5-7 preguntas frecuentes",
        monetization: null,
      },
      {
        section: "conclusion",
        content: "Recomendación final + CTA",
        monetization: {
          type: "cta-buttons",
          placement: "bottom",
          component: "MonetizationHub",
        },
      },
      {
        section: "disclaimer",
        content: "Disclaimer de afiliados",
        monetization: {
          type: "disclaimer",
          placement: "bottom",
          component: "AffiliateDisclaimer",
        },
      },
    ],
    seoPattern: "[Keyword] vs [Alternative] 2025: ¿Cuál es Mejor?",
    keywords: ["vs", "mejor", "comparación", "diferencia entre"],
  },

  /**
   * TEMPLATE 2: REVIEW (análisis de 1 producto/herramienta)
   * Ejemplo: "Review de Notion 2025", "Vale la pena GitHub Copilot?"
   */
  review: {
    name: "Review Detallada",
    structure: [
      {
        section: "intro",
        content: "Por qué probé esto + contexto personal",
        monetization: null,
      },
      {
        section: "verdict-box",
        content: "Veredicto rápido: Rating + pros/cons",
        monetization: {
          type: "product-card",
          placement: "top",
          component: "AmazonAffiliate",
        },
      },
      {
        section: "what-is-it",
        content: "Qué es + para quién está pensado",
        monetization: null,
      },
      {
        section: "features-deep-dive",
        content: "Features principales explicadas (H3 por feature)",
        monetization: null,
      },
      {
        section: "real-world-testing",
        content: "Cómo lo usé (ejemplos reales, screenshots mentales)",
        monetization: null,
      },
      {
        section: "pros-cons",
        content: "Lo bueno, lo malo, lo feo",
        monetization: null,
      },
      {
        section: "pricing",
        content: "Planes y precios explicados",
        monetization: {
          type: "cta-inline",
          placement: "after-pricing",
          text: "Ver Precios Actuales",
        },
      },
      {
        section: "alternatives",
        content: "3 alternativas + cuándo elegir cada una",
        monetization: {
          type: "comparison-mini",
          products: 3,
        },
      },
      {
        section: "conclusion",
        content: "¿Vale la pena? Mi recomendación",
        monetization: {
          type: "cta-buttons",
          placement: "bottom",
          component: "MonetizationHub",
        },
      },
      {
        section: "disclaimer",
        content: "Disclaimer de afiliados",
        monetization: {
          type: "disclaimer",
          placement: "bottom",
          component: "AffiliateDisclaimer",
        },
      },
    ],
    seoPattern: "[Producto] Review 2025: ¿Vale la Pena?",
    keywords: ["review", "opinión", "vale la pena", "análisis"],
  },

  /**
   * TEMPLATE 3: BUYING GUIDE (guía de compra)
   * Ejemplo: "Cómo elegir teclado mecánico", "Mejores monitores para programar"
   */
  buyingGuide: {
    name: "Guía de Compra",
    structure: [
      {
        section: "intro",
        content: "Por qué es difícil elegir + qué cambió en 2025",
        monetization: null,
      },
      {
        section: "top-picks",
        content: "Mis 3 recomendaciones principales (quick summary)",
        monetization: {
          type: "comparison-table",
          products: 3,
          component: "ComparisonTable",
        },
      },
      {
        section: "buying-criteria",
        content: "Qué buscar (specs, features, trade-offs)",
        monetization: null,
      },
      {
        section: "detailed-reviews",
        content: "Review de cada producto recomendado (H2 por producto)",
        monetization: {
          type: "product-block",
          placement: "after-each-product",
          component: "AmazonAffiliate",
        },
      },
      {
        section: "use-cases",
        content: "Qué elegir según tu situación (principiante, pro, budget)",
        monetization: null,
      },
      {
        section: "what-to-avoid",
        content: "Red flags y errores comunes",
        monetization: null,
      },
      {
        section: "faq",
        content: "Preguntas frecuentes",
        monetization: null,
      },
      {
        section: "conclusion",
        content: "Recomendación final + próximos pasos",
        monetization: {
          type: "cta-buttons",
          placement: "bottom",
          component: "MonetizationHub",
        },
      },
      {
        section: "disclaimer",
        content: "Disclaimer de afiliados",
        monetization: {
          type: "disclaimer",
          placement: "bottom",
          component: "AffiliateDisclaimer",
        },
      },
    ],
    seoPattern: "Mejores [Productos] para [Uso] 2025: Guía Completa",
    keywords: ["mejores", "cómo elegir", "guía de compra", "recomendaciones"],
  },
};

/**
 * Detecta qué template usar basándose en el keyword
 */
export function detectTemplate(keyword) {
  const kw = keyword.toLowerCase();

  // Comparison
  if (
    kw.includes(" vs ") ||
    kw.includes("mejor") ||
    kw.includes("comparación") ||
    kw.includes("diferencia")
  ) {
    return "comparison";
  }

  // Review
  if (
    kw.includes("review") ||
    kw.includes("opinión") ||
    kw.includes("vale la pena") ||
    kw.includes("análisis")
  ) {
    return "review";
  }

  // Buying Guide
  if (
    kw.includes("cómo elegir") ||
    kw.includes("guía") ||
    kw.includes("recomendaciones")
  ) {
    return "buyingGuide";
  }

  // Default: buying guide (más genérico)
  return "buyingGuide";
}

/**
 * Genera el prompt de GPT con el template específico
 */
export function buildPromptWithTemplate(
  keyword,
  template,
  products,
  competitorContext
) {
  const templateData = ARTICLE_TEMPLATES[template];
  const today = new Date().toISOString().split("T")[0];

  // Construir estructura detallada
  const structurePrompt = templateData.structure
    .map((section, i) => {
      let sectionText = `${i + 1}. **${section.section}**: ${section.content}`;

      if (section.monetization) {
        if (section.monetization.type === "product-block") {
          sectionText += `\n   💰 Después de cada review, insertá:\n   <AmazonAffiliate asin="[ASIN]" variant="full" />`;
        } else if (section.monetization.type === "comparison-table") {
          sectionText += `\n   💰 Insertá:\n   <ComparisonTable products={[array]} />`;
        } else if (section.monetization.type === "cta-buttons") {
          sectionText += `\n   💰 Al final:\n   <MonetizationHub placement="bottom" category="[categoría]" postTitle="[título]" />`;
        } else if (section.monetization.type === "disclaimer") {
          sectionText += `\n   ⚖️ <AffiliateDisclaimer placement="bottom" />`;
        }
      }

      return sectionText;
    })
    .join("\n\n");

  // Productos formateados
  const productContext =
    products.length > 0
      ? products
          .map(
            (p, i) =>
              `${i + 1}. **${p.name}** - ${p.price} (${p.rating}⭐)\n   ASIN: ${p.asin}\n   ${p.features.join(", ")}\n   Mejor para: ${p.bestFor}`
          )
          .join("\n\n")
      : "No hay productos disponibles";

  return `Sos un experto en reviews y análisis de productos. Escribís en español argentino con voseo natural.

**Keyword:** "${keyword}"
**Template:** ${templateData.name}
**SEO Title Pattern:** ${templateData.seoPattern}

**Competencia analizada:**
${competitorContext}

**Productos disponibles:**
${productContext}

**ESTRUCTURA A SEGUIR:**

${structurePrompt}

**REGLAS DE MONETIZACIÓN:**

1. **NATURALIDAD**: Los productos se mencionan donde aportan valor, no se fuerzan
2. **EDUCACIÓN PRIMERO**: 70% contenido educativo, 30% productos
3. **CTAs SUTILES**: "Ver precio actual", "Comparar opciones", no "¡COMPRA YA!"
4. **DISCLAIMERS**: Siempre al final con <AffiliateDisclaimer placement="bottom" />

**COMPONENTES DISPONIBLES:**

\`\`\`astro
import ComparisonTable from '../../components/ComparisonTable.astro';
import AmazonAffiliate from '../../components/AmazonAffiliate.astro';
import AffiliateDisclaimer from '../../components/AffiliateDisclaimer.astro';
import MonetizationHub from '../../components/MonetizationHub.astro';

// Uso:
<AmazonAffiliate asin="B0BK3RGLX3" variant="card" />
<ComparisonTable products={productsArray} />
<MonetizationHub placement="middle" category="Hardware" postTitle="..." />
\`\`\`

**TONO:**
- Voseo argentino: "vos tenés", "fijate", "podés"
- Conversacional pero profesional
- Emojis moderados (2-3 por sección)
- Párrafos cortos (2-3 líneas máx)

**SEO:**
- Title: 50-60 caracteres con keyword principal
- Meta: 150-155 con CTA emocional
- 4+ H2 con variaciones de keyword
- Alt text en imágenes de productos

**Output esperado:**

---
title: "[Título SEO usando el pattern]"
description: "[Meta description con CTA]"
pubDate: ${today}
heroImage: "/images/default-hero.jpg"
category: "Hardware"
tags: ["tag1", "tag2", "tag3"]
featured: true
readingTime: "X min"
---

import ComparisonTable from '../../components/ComparisonTable.astro';
import AmazonAffiliate from '../../components/AmazonAffiliate.astro';
import AffiliateDisclaimer from '../../components/AffiliateDisclaimer.astro';
import MonetizationHub from '../../components/MonetizationHub.astro';

[Contenido completo siguiendo la estructura del template]

**IMPORTANTE:** Seguí EXACTAMENTE la estructura del template. Cada sección debe estar presente.`;
}

/**
 * Valida que el artículo generado tenga los componentes de monetización
 */
export function validateMonetization(content, template) {
  const errors = [];
  const templateData = ARTICLE_TEMPLATES[template];

  // Verificar imports
  const requiredImports = [
    "AmazonAffiliate",
    "AffiliateDisclaimer",
    template === "comparison" ? "ComparisonTable" : null,
  ].filter(Boolean);

  requiredImports.forEach((imp) => {
    if (!content.includes(`import ${imp}`)) {
      errors.push(`❌ Falta import: ${imp}`);
    }
  });

  // Verificar componentes en el contenido
  templateData.structure.forEach((section) => {
    if (section.monetization) {
      const { component } = section.monetization;
      if (component && !content.includes(`<${component}`)) {
        errors.push(
          `❌ Falta componente en "${section.section}": <${component} />`
        );
      }
    }
  });

  // Verificar disclaimer (obligatorio)
  if (!content.includes("<AffiliateDisclaimer")) {
    errors.push("❌ Falta <AffiliateDisclaimer /> al final");
  }

  return { valid: errors.length === 0, errors };
}

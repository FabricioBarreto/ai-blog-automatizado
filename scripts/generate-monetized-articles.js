// scripts/generate-monetized-articles.js
// Script para generar artículos optimizados para monetización con Amazon
// Versión ES Modules compatible

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURACIÓN =====
// OJO: el tag se agrega en los COMPONENTES (single source of truth)
const OUTPUT_DIR = path.join(__dirname, "../src/content/blog");

// ===== PLANTILLAS DE ARTÍCULOS MONETIZADOS =====
const articleTemplates = [
  {
    id: "best-keyboards-remote-work",
    title:
      "Los 7 Mejores Teclados Mecánicos para Trabajo Remoto con IA en 2025",
    description:
      "Descubre los teclados mecánicos más productivos con switches personalizables, retroiluminación RGB y macros para maximizar tu eficiencia",
    category: "Hardware",
    tags: ["teclados", "productividad", "hardware", "trabajo-remoto"],
    products: [
      {
        name: "Keychron K8 Pro",
        asin: "B0BK3RGLX3",
        price: "$109",
        rating: 4.5,
        pros: [
          "Hot-swappable",
          "Wireless + USB-C",
          "Batería 240h",
          "Programable con VIA",
        ],
        cons: ["Sin numpad", "Perfil alto"],
      },
      {
        name: "Logitech MX Keys",
        asin: "B07S92QBCM",
        price: "$119",
        rating: 4.6,
        pros: [
          "Teclas perfectas",
          "Multi-dispositivo",
          "Retroiluminación inteligente",
          "Batería recargable",
        ],
        cons: ["No mecánico", "Caro"],
      },
    ],
  },
  {
    id: "best-monitors-productivity-2025",
    title: "Los 5 Mejores Monitores para Productividad y Multitarea en 2025",
    description:
      "Guía completa de monitores 4K, ultrawide y con tecnología de reducción de fatiga visual para trabajar todo el día sin cansancio",
    category: "Hardware",
    tags: ["monitores", "productividad", "hardware"],
    products: [
      {
        name: "LG 34WN80C-B Ultrawide",
        asin: "B07YGZ7C1K",
        price: "$449",
        rating: 4.6,
        pros: ['34" ultrawide', "USB-C 60W", "QHD 3440x1440", "Color sRGB 99%"],
        cons: ["No 4K", "Sin HDR"],
      },
      {
        name: 'Dell U2723DE 27" 4K',
        asin: "B09TQPG3N4",
        price: "$529",
        rating: 4.7,
        pros: ["4K IPS", "USB-C 90W", "Hub USB integrado", "Altura ajustable"],
        cons: ["Caro", "No curved"],
      },
    ],
  },
  {
    id: "best-webcams-video-calls-2025",
    title: "Las 6 Mejores Webcams con IA para Videollamadas Profesionales",
    description:
      "Webcams 4K con autoenfoque, corrección de luz y filtros de IA para lucir profesional en Zoom, Teams y Google Meet",
    category: "Hardware",
    tags: ["webcams", "videollamadas", "IA", "trabajo-remoto"],
    products: [
      {
        name: "Logitech Brio 4K Pro",
        asin: "B01N5UOYC4",
        price: "$199",
        rating: 4.3,
        pros: [
          "4K 30fps",
          "HDR",
          "Autoenfoque 5x",
          "Campo de visión ajustable",
        ],
        cons: ["Cara", "Necesita buena PC"],
      },
    ],
  },
  {
    id: "best-standing-desks-productivity",
    title:
      "Los 5 Mejores Escritorios de Pie (Standing Desks) para Salud y Productividad",
    description:
      "Escritorios ajustables eléctricos con memoria de altura, estabilidad premium y gestión de cables para trabajar de pie sin sacrificar comodidad",
    category: "Ergonomía",
    tags: ["escritorios", "ergonomía", "salud", "standing-desk"],
    products: [
      {
        name: "FlexiSpot E7 Pro Plus",
        asin: "B09MJFQT8Y",
        price: "$599",
        rating: 4.7,
        pros: [
          "Capacidad 355 lbs",
          "4 memorias altura",
          "Ultra estable",
          "Motor dual silencioso",
        ],
        cons: ["Caro", "Instalación compleja"],
      },
    ],
  },
  {
    id: "best-noise-cancelling-earbuds-work",
    title:
      "Los 8 Mejores Auriculares In-Ear con Cancelación de Ruido para Trabajar",
    description:
      "Earbuds compactos con ANC, modo transparencia y batería de larga duración para trabajar desde cualquier lugar",
    category: "Audio",
    tags: ["earbuds", "audio", "ANC", "portabilidad"],
    products: [
      {
        name: "Sony WF-1000XM5",
        asin: "B0C33XXS56",
        price: "$299",
        rating: 4.6,
        pros: [
          "Mejor ANC en earbuds",
          "Batería 8h + 24h",
          "LDAC Hi-Res",
          "AI NC",
        ],
        cons: ["Caros", "No controles físicos"],
      },
    ],
  },
];

// ===== HELPERS =====

function slugify(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Importante: sin tag (el tag se agrega en componentes)
function createAmazonLink(asin) {
  return `https://www.amazon.com/dp/${asin}`;
}

function escapeAttr(value) {
  return String(value).replaceAll(`"`, "&quot;");
}

function generateProductCard(product) {
  const description = `${product.pros.join(". ")}. ${product.cons
    .map((c) => "Desventaja: " + c)
    .join(". ")}`;

  return `
<AmazonAffiliate 
  productName="${escapeAttr(product.name)}"
  amazonUrl="${escapeAttr(createAmazonLink(product.asin))}"
  price="${escapeAttr(product.price)}"
  rating={${product.rating}}
  description="${escapeAttr(description)}"
  buttonText="Ver Precio en Amazon"
  ctaStyle="primary"
/>`;
}

function generateComparisonTable(products) {
  const productsArray = products
    .map(
      (p, idx) => `    {
      name: "${escapeAttr(p.name)}",
      image: "https://via.placeholder.com/400x300?text=${encodeURIComponent(
        p.name
      )}",
      rating: ${p.rating},
      price: "${escapeAttr(p.price)}",
      bestFor: "Usuario típico",
      pros: ${JSON.stringify(p.pros)},
      cons: ${JSON.stringify(p.cons)},
      amazonUrl: "${escapeAttr(createAmazonLink(p.asin))}",
      isBestChoice: ${idx === 0}
    }`
    )
    .join(",\n");

  return `
<ComparisonTable 
  title="Comparativa Completa"
  products={[
${productsArray}
  ]}
/>`;
}

function generateArticleContent(template) {
  const { title, description, category, tags, products } = template;

  // Importante: no metemos "última actualización" dinámica en el body,
  // porque te generaba commits diarios.
  // Si querés refresh real, metés updatedDate en frontmatter cuando cambie algo real.
  return `---
title: "${escapeAttr(title)}"
description: "${escapeAttr(description)}"
pubDate: "${new Date().toISOString().split("T")[0]}"
category: "${escapeAttr(category)}"
tags: ${JSON.stringify(tags)}
featured: true
heroImage: "/images/default-hero.jpg"
---

import AmazonAffiliate from '../../components/AmazonAffiliate.astro';
import ComparisonTable from '../../components/ComparisonTable.astro';
import AffiliateDisclaimer from '../../components/AffiliateDisclaimer.astro';

# ${title}

${description}

En esta guía completa, analicé los mejores productos para ayudarte a elegir según presupuesto, uso y prioridades.

## ⚡ TL;DR (si estás apurado)

- **Mejor opción general:** ${products[0].name}
- **Alternativa recomendada:** ${products[1]?.name || products[0].name}
- **Qué mirar sí o sí:** presupuesto, compatibilidad, comodidad y garantía.

---

## 🎯 Factores Clave a Considerar

- ✅ **Presupuesto**: ¿Cuánto estás dispuesto a invertir?
- ✅ **Uso diario**: ¿Cuántas horas al día lo usarás?
- ✅ **Compatibilidad**: ¿Con qué dispositivos necesitás que funcione?
- ✅ **Características premium**: ¿Qué funciones son imprescindibles?

---

## 🏆 Comparativa: Top ${products.length}

${generateComparisonTable(products)}

---

## 🥇 Mi Recomendación #1: ${products[0].name}

${generateProductCard(products[0])}

### ¿Por qué es el mejor?

${products[0].pros
  .map(
    (pro, i) => `
**${i + 1}. ${pro}**

Explicación detallada de por qué esta característica importa y cómo te beneficia en el día a día.
`
  )
  .join("\n")}

### Consideraciones

${products[0].cons
  .map(
    (con) =>
      `- ⚠️ ${con}: Puede ser una limitación, pero depende de tu caso de uso.`
  )
  .join("\n")}

---

${products
  .slice(1)
  .map(
    (product, index) => `
## ${
      index === 0
        ? "💰 Mejor Relación Calidad-Precio"
        : `🔧 Opción ${index + 2}`
    }: ${product.name}

${generateProductCard(product)}

**Pros destacados:**
${product.pros.map((pro) => `- ✅ ${pro}`).join("\n")}

**Contras a considerar:**
${product.cons.map((con) => `- ❌ ${con}`).join("\n")}

---
`
  )
  .join("\n")}

## 📊 Tabla Comparativa Rápida

| Modelo | Precio | Rating | Mejor Para |
|--------|--------|--------|------------|
${products
  .map((p) => `| ${p.name} | ${p.price} | ${p.rating}/5 ⭐ | ${p.pros[0]} |`)
  .join("\n")}

---

## 🎯 ¿Cuál Debés Elegir?

**Elegí ${products[0].name} si:**
${products[0].pros.map((pro) => `- ✅ ${pro.toLowerCase()}`).join("\n")}

${products
  .slice(1)
  .map(
    (p) => `
**Elegí ${p.name} si:**
${p.pros
  .slice(0, 2)
  .map((pro) => `- ✅ ${pro.toLowerCase()}`)
  .join("\n")}
`
  )
  .join("\n")}

---

## 🚀 Conclusión

Mi recomendación clara para la mayoría es **${
    products[0].name
  }**: balancea rendimiento, funciones y valor.

Si querés ver el precio actualizado y reviews reales, usá los botones de arriba (sí, son enlaces de afiliado).

---

<AffiliateDisclaimer placement="bottom" />

---

## 💬 Preguntas Frecuentes

**¿Vale la pena pagar más por ${products[0].name}?**  
Sí, si lo vas a usar a diario: la diferencia suele estar en durabilidad y experiencia.

**¿Hay opciones más baratas que funcionen bien?**  
${products[products.length - 1].name} suele ser un buen “value pick”.

**¿Cuánto duran estos productos?**  
Con uso normal, esperá 3–5 años (y más si no los castigás).`;
}

// ===== FUNCIÓN PRINCIPAL =====

function generateArticles() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("🚀 Generando artículos monetizados...\n");

  let generatedCount = 0;

  articleTemplates.forEach((template, index) => {
    const slug = slugify(template.title);
    const filename = `${slug}.mdx`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // ✅ No reescribir si ya existe (evita commits diarios)
    if (fs.existsSync(filepath)) {
      console.log(
        `⏭️  [${index + 1}/${
          articleTemplates.length
        }] Skip (ya existe): ${filename}`
      );
      return;
    }

    const content = generateArticleContent(template);
    fs.writeFileSync(filepath, content, "utf-8");
    generatedCount++;

    console.log(
      `✅ [${index + 1}/${articleTemplates.length}] Generado: ${filename}`
    );
    console.log(`   📝 Título: ${template.title}`);
    console.log(`   💰 Productos: ${template.products.length}`);
    console.log(`   🔗 Categoría: ${template.category}\n`);
  });

  console.log("✨ ¡Proceso completado!");
  console.log(`📊 Artículos NUEVOS generados: ${generatedCount}`);
  console.log(`📁 Ubicación: ${OUTPUT_DIR}`);
}

generateArticles();

export { generateArticles };

// scripts/add-internal-links.js
// ✅ Agrega internal links automáticamente basado en keywords

import fs from "fs";
import path from "path";
import { glob } from "glob";

const CONTENT_DIR = "src/content/blog";

// Mapeo de keywords → URLs (se construye dinámicamente)
const linkMap = new Map();

// Keywords que queremos linkear (expandir esto)
const LINKEABLE_KEYWORDS = [
  { phrase: "teclado mecánico", plurals: ["teclados mecánicos"] },
  { phrase: "monitor 4K", plurals: ["monitores 4K"] },
  { phrase: "auricular", plurals: ["auriculares"] },
  { phrase: "standing desk", plurals: ["standing desks", "escritorio de pie"] },
  { phrase: "webcam", plurals: ["webcams"] },
  { phrase: "productividad", plurals: [] },
  { phrase: "trabajo remoto", plurals: [] },
];

async function buildLinkMap() {
  const files = await glob(`${CONTENT_DIR}/**/*.{md,mdx}`);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const titleMatch = content.match(/^title:\s*["'](.+?)["']/m);

    if (!titleMatch) continue;

    const title = titleMatch[1];
    const slug = path.basename(file, path.extname(file));
    const url = `/blog/${slug}`;

    // Buscar keywords en el título
    for (const kw of LINKEABLE_KEYWORDS) {
      const allVariants = [kw.phrase, ...kw.plurals];

      for (const variant of allVariants) {
        if (title.toLowerCase().includes(variant.toLowerCase())) {
          linkMap.set(variant.toLowerCase(), { url, title });
          break;
        }
      }
    }
  }

  console.log(`✅ Built link map with ${linkMap.size} entries`);
}

async function addInternalLinks() {
  await buildLinkMap();

  const files = await glob(`${CONTENT_DIR}/**/*.{md,mdx}`);
  let totalLinksAdded = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, "utf-8");
    const originalContent = content;

    // Separar frontmatter del body
    const parts = content.split("---");
    if (parts.length < 3) continue;

    const frontmatter = parts[1];
    let body = parts.slice(2).join("---");

    // Evitar linkear dentro de componentes/código
    const protectedBlocks = [];
    body = body.replace(/```[\s\S]*?```|<[^>]+>[\s\S]*?<\/[^>]+>/g, (match) => {
      const placeholder = `__PROTECTED_${protectedBlocks.length}__`;
      protectedBlocks.push(match);
      return placeholder;
    });

    let linksAdded = 0;

    // Para cada keyword, buscar primera aparición y linkear
    for (const [keyword, data] of linkMap.entries()) {
      const currentUrl = `/blog/${path.basename(file, path.extname(file))}`;

      // No linkear a sí mismo
      if (data.url === currentUrl) continue;

      // Regex case-insensitive, pero respetando capitalización original
      const regex = new RegExp(`\\b(${keyword})\\b(?![^<]*>)`, "i");
      const match = body.match(regex);

      if (match && !body.includes(`[${match[1]}]`)) {
        // Primera aparición: linkear
        body = body.replace(regex, `[$1](${data.url} "${data.title}")`);
        linksAdded++;

        // Limitar a 5 internal links por artículo (no saturar)
        if (linksAdded >= 5) break;
      }
    }

    // Restaurar bloques protegidos
    protectedBlocks.forEach((block, i) => {
      body = body.replace(`__PROTECTED_${i}__`, block);
    });

    if (linksAdded > 0) {
      const newContent = `---${frontmatter}---${body}`;
      fs.writeFileSync(file, newContent, "utf-8");
      totalLinksAdded += linksAdded;
      console.log(`✅ ${path.basename(file)}: +${linksAdded} internal links`);
    }
  }

  console.log(`\n🎉 Total internal links added: ${totalLinksAdded}`);
}

// Ejecutar
addInternalLinks().catch(console.error);

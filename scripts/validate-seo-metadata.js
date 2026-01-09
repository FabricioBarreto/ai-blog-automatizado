import fs from "fs";
import path from "path";

const BLOG_DIR = "./src/content/blog";

function validateMetadata() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const issues = [];

  files.forEach((file) => {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const frontmatter = content.match(/---\n([\s\S]*?)\n---/)?.[1];

    if (!frontmatter) return;

    const title = frontmatter.match(/title:\s*["'](.+)["']/)?.[1];
    const description = frontmatter.match(/description:\s*["'](.+)["']/)?.[1];

    // Validar título
    if (!title) {
      issues.push(`❌ ${file}: Sin título`);
    } else if (title.length < 40) {
      issues.push(
        `⚠️ ${file}: Título muy corto (${title.length} chars) - Ideal: 50-60`
      );
    } else if (title.length > 70) {
      issues.push(
        `⚠️ ${file}: Título muy largo (${title.length} chars) - Se cortará en Google`
      );
    }

    // Validar descripción
    if (!description) {
      issues.push(`❌ ${file}: Sin descripción`);
    } else if (description.length < 120) {
      issues.push(
        `⚠️ ${file}: Descripción muy corta (${description.length} chars) - Ideal: 150-160`
      );
    } else if (description.length > 170) {
      issues.push(
        `⚠️ ${file}: Descripción muy larga (${description.length} chars)`
      );
    }

    // Validar que NO tenga año antiguo en title
    if (title && title.match(/202[0-4]/)) {
      issues.push(
        `⚠️ ${file}: Título con año antiguo - Actualizar a 2025/2026`
      );
    }
  });

  if (issues.length > 0) {
    console.log("\n🔍 PROBLEMAS DE SEO DETECTADOS:\n");
    issues.forEach((i) => console.log(i));
    console.log(`\n📊 Total: ${issues.length} problemas`);
  } else {
    console.log("✅ Todos los artículos tienen metadata SEO óptima");
  }
}

validateMetadata();

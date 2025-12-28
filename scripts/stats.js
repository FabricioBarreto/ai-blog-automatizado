// scripts/stats.js
// Estadísticas del blog: artículos, keywords, productos, etc.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStats() {
  const blogDir = path.join(__dirname, "../src/content/blog");
  const imagesDir = path.join(__dirname, "../public/images");

  // Contar artículos
  const articles = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    : [];

  // Contar imágenes
  const images = fs.existsSync(imagesDir)
    ? fs.readdirSync(imagesDir).filter((f) => /\.(jpg|png|webp)$/.test(f))
    : [];

  // Analizar contenido
  let totalWords = 0;
  const keywords = new Set();

  articles.forEach((file) => {
    const content = fs.readFileSync(path.join(blogDir, file), "utf-8");

    // Contar palabras
    const words = content.split(/\s+/).length;
    totalWords += words;

    // Extraer tags
    const tagsMatch = content.match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch) {
      const tags = tagsMatch[1].split(",").map((t) => t.trim().replace(/['"]/g, ""));
      tags.forEach((tag) => keywords.add(tag));
    }
  });

  return {
    articles: articles.length,
    images: images.length,
    totalWords,
    avgWordsPerArticle: articles.length > 0 ? Math.round(totalWords / articles.length) : 0,
    keywords: keywords.size,
    keywordList: Array.from(keywords),
  };
}

function displayStats() {
  console.log("📊 Blog Statistics");
  console.log("==================\n");

  const stats = getStats();

  console.log(`📝 Total Articles: ${stats.articles}`);
  console.log(`🖼️  Total Images: ${stats.images}`);
  console.log(`📖 Total Words: ${stats.totalWords.toLocaleString()}`);
  console.log(`📊 Avg Words/Article: ${stats.avgWordsPerArticle}`);
  console.log(`🏷️  Unique Keywords: ${stats.keywords}`);

  if (stats.keywordList.length > 0) {
    console.log(`\n🔑 Top Keywords:`);
    stats.keywordList.slice(0, 10).forEach((kw, i) => {
      console.log(`   ${i + 1}. ${kw}`);
    });
  }

  // Estimación de valor SEO (muy básico)
  const seoValue = stats.articles * 50; // $50 valor promedio por artículo SEO
  console.log(`\n💰 Estimated SEO Value: $${seoValue.toLocaleString()}`);
  console.log(`   (Based on $50/article industry average)`);

  console.log("\n✨ Keep creating awesome content!");
}

displayStats();

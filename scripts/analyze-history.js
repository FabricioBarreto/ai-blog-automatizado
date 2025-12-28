// scripts/analyze-history.js
// Analiza el historial de artículos y da insights sobre diversidad de contenido

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRACKING_FILE = path.join(__dirname, "../.article-history.json");

function analyzeHistory() {
  if (!fs.existsSync(TRACKING_FILE)) {
    console.log(
      "⚠️  No hay historial todavía. Generá algunos artículos primero."
    );
    return;
  }

  const history = JSON.parse(fs.readFileSync(TRACKING_FILE, "utf-8"));

  if (!history.topics || history.topics.length === 0) {
    console.log("⚠️  Historial vacío.");
    return;
  }

  console.log("📊 ANÁLISIS DE CONTENIDO\n");
  console.log("=".repeat(60));

  // Stats generales
  const totalArticles = history.topics.length;
  const monetized = history.topics.filter((t) => t.type === "monetized").length;
  const value = history.topics.filter((t) => t.type === "value").length;

  console.log(`\n📝 Total de artículos: ${totalArticles}`);
  console.log(
    `💰 Con productos (monetizados): ${monetized} (${(
      (monetized / totalArticles) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `📚 Puro valor (educativos): ${value} (${(
      (value / totalArticles) *
      100
    ).toFixed(1)}%)`
  );

  // Balance recomendado
  const monetizedRatio = monetized / totalArticles;
  let balanceStatus = "✅ Balance perfecto (70/30)";

  if (monetizedRatio > 0.8) {
    balanceStatus =
      "⚠️  Demasiados artículos con productos. Agregá más contenido educativo.";
  } else if (monetizedRatio < 0.6) {
    balanceStatus =
      "⚠️  Poco contenido monetizado. Podés agregar más reviews/comparativas.";
  }

  console.log(`\n${balanceStatus}`);

  // Últimos 10 artículos
  console.log(`\n📋 ÚLTIMOS 10 ARTÍCULOS:\n`);
  const recent = history.topics.slice(-10).reverse();

  recent.forEach((topic, i) => {
    const emoji = topic.type === "monetized" ? "💰" : "📚";
    const date = new Date(topic.date).toLocaleDateString("es-AR");
    console.log(`${emoji} ${date} - ${topic.keyword.slice(0, 60)}`);
  });

  // Temas más frecuentes
  console.log(`\n🔥 CATEGORÍAS MÁS CUBIERTAS:\n`);

  const categories = {};
  history.topics.forEach((topic) => {
    const words = topic.keyword.toLowerCase().split(/\s+/);
    const mainWords = words.filter((w) => w.length > 4); // Filtrar palabras cortas

    mainWords.forEach((word) => {
      categories[word] = (categories[word] || 0) + 1;
    });
  });

  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  topCategories.forEach(([word, count]) => {
    const bar = "█".repeat(Math.ceil((count / topCategories[0][1]) * 20));
    console.log(`${word.padEnd(20)} ${bar} ${count}`);
  });

  // Diversidad temporal
  console.log(`\n📅 FRECUENCIA DE PUBLICACIÓN:\n`);

  const byMonth = {};
  history.topics.forEach((topic) => {
    const month = new Date(topic.date).toISOString().slice(0, 7); // YYYY-MM
    byMonth[month] = (byMonth[month] || 0) + 1;
  });

  Object.entries(byMonth)
    .sort()
    .slice(-6)
    .forEach(([month, count]) => {
      const [year, m] = month.split("-");
      const monthName = new Date(year, m - 1).toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric",
      });
      console.log(`${monthName.padEnd(20)} ${count} artículos`);
    });

  // Recomendaciones
  console.log(`\n💡 RECOMENDACIONES:\n`);

  const suggestions = [];

  // Chequear si hay temas repetidos muy recientes
  const last30Days = history.topics.filter((t) => {
    const daysSince = (Date.now() - new Date(t.date)) / (1000 * 60 * 60 * 24);
    return daysSince < 30;
  });

  const recentKeywords = last30Days.map((t) => t.keyword.toLowerCase());
  const duplicates = recentKeywords.filter((k, i, arr) => {
    const similar = arr.filter((other) => {
      const words1 = k.split(/\s+/);
      const words2 = other.split(/\s+/);
      const overlap = words1.filter((w) => words2.includes(w)).length;
      return overlap / Math.max(words1.length, words2.length) > 0.5;
    });
    return similar.length > 1;
  });

  if (duplicates.length > 0) {
    suggestions.push(
      "⚠️  Detectamos temas similares en el último mes. El sistema evitará repeticiones."
    );
  }

  if (monetizedRatio > 0.8) {
    suggestions.push(
      "📚 Considerá agregar más contenido educativo (guías, tutoriales, frameworks)."
    );
  }

  if (value < 3 && totalArticles > 10) {
    suggestions.push(
      "🎓 Artículos educativos puros generan más engagement y shares."
    );
  }

  const hasProductReviews = history.topics.some(
    (t) => t.keyword.includes("best") || t.keyword.includes("top")
  );
  if (!hasProductReviews) {
    suggestions.push(
      '💰 Considerá keywords tipo "best [producto] for [necesidad]" para monetización.'
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("✅ Todo se ve bien. Seguí generando contenido variado.");
  }

  suggestions.forEach((s) => console.log(`   ${s}`));

  console.log(`\n${"=".repeat(60)}\n`);
  console.log("💾 Historial guardado en: .article-history.json");
  console.log(
    "🔄 Este tracking ayuda a evitar repeticiones y mantener balance.\n"
  );
}

analyzeHistory();

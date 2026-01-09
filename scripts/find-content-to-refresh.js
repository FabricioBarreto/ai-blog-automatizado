import fs from "fs";
import path from "path";

const BLOG_DIR = "./src/content/blog";
const DAYS_THRESHOLD = 90;

function findOldContent() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const now = Date.now();

  const toRefresh = [];

  files.forEach((file) => {
    const filepath = path.join(BLOG_DIR, file);
    const stats = fs.statSync(filepath);
    const daysSinceModified = (now - stats.mtime) / (1000 * 60 * 60 * 24);

    if (daysSinceModified > DAYS_THRESHOLD) {
      const content = fs.readFileSync(filepath, "utf-8");
      const title = content.match(/title:\s*["'](.+)["']/)?.[1];
      const pubDate = content.match(/pubDate:\s*(.+)/)?.[1];

      toRefresh.push({
        file,
        title,
        pubDate,
        daysSinceModified: Math.round(daysSinceModified),
      });
    }
  });

  toRefresh.sort((a, b) => b.daysSinceModified - a.daysSinceModified);

  console.log("\n🔄 ARTÍCULOS PARA REFRESCAR:\n");

  if (toRefresh.length === 0) {
    console.log("✅ Todos los artículos están actualizados");
    return;
  }

  toRefresh.forEach((item, i) => {
    console.log(`${i + 1}. ${item.title}`);
    console.log(`   📅 Publicado: ${item.pubDate}`);
    console.log(
      `   ⏰ Última modificación: hace ${item.daysSinceModified} días`
    );
    console.log(`   📄 ${item.file}\n`);
  });

  console.log(`\n📊 Total a refrescar: ${toRefresh.length} artículos`);
}

findOldContent();

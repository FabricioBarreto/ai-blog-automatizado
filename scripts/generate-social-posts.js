import fs from "fs";
import path from "path";

function generateSocialPosts(articlePath) {
  const content = fs.readFileSync(articlePath, "utf-8");
  const frontmatter = content.match(/---\n([\s\S]*?)\n---/)?.[1];

  const title = frontmatter.match(/title:\s*["'](.+)["']/)?.[1];
  const description = frontmatter.match(/description:\s*["'](.+)["']/)?.[1];
  const tags = frontmatter
    .match(/tags:\s*\[([^\]]+)\]/)?.[1]
    .split(",")
    .map((t) => t.trim().replace(/["']/g, ""));

  const slug = path.basename(articlePath, ".mdx");
  const url = `https://www.productivitylab.online/blog/${slug}`;

  // Twitter/X
  const tweet = `${title}

${description.substring(0, 100)}...

${tags
  .slice(0, 3)
  .map((t) => `#${t.replace(/\s+/g, "")}`)
  .join(" ")}

🔗 ${url}`;

  // LinkedIn
  const linkedin = `${title}

${description}

En este artículo descubrirás:
[Extraer 3 puntos del contenido]

Lee el artículo completo: ${url}

${tags
  .slice(0, 5)
  .map((t) => `#${t.replace(/\s+/g, "")}`)
  .join(" ")}`;

  // Facebook
  const facebook = `🚀 ${title}

${description}

👉 ${url}`;

  // Guardar
  const outputDir = "./social-posts";
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, `${slug}-social.txt`),
    `TWITTER/X:\n${tweet}\n\n---\n\nLINKEDIN:\n${linkedin}\n\n---\n\nFACEBOOK:\n${facebook}`
  );

  console.log(`✅ Posts generados para: ${title}`);
}

// Ejecutar para el artículo más reciente
const blogDir = "./src/content/blog";
const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith(".mdx"))
  .sort()
  .reverse();

if (files.length > 0) {
  generateSocialPosts(path.join(blogDir, files[0]));
}

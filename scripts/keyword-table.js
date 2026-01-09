import fs from "fs";

function generateKeywordTable() {
  const files = fs
    .readdirSync("./src/content/blog")
    .filter((f) => f.endsWith(".mdx"));

  const table = [];

  files.forEach((file) => {
    const content = fs.readFileSync(`./src/content/blog/${file}`, "utf-8");
    const title = content.match(/title:\s*["'](.+)["']/)?.[1];
    const tags = content.match(/tags:\s*\[([^\]]+)\]/)?.[1];

    if (title && tags) {
      table.push({
        title,
        primaryKeyword: tags.split(",")[0].trim().replace(/["']/g, ""),
        url: `https://www.productivitylab.online/blog/${file.replace(".mdx", "")}`,
      });
    }
  });

  console.log("\n| Artículo | Keyword Principal | URL |");
  console.log("|----------|-------------------|-----|");
  table.forEach((row) => {
    console.log(`| ${row.title} | ${row.primaryKeyword} | ${row.url} |`);
  });
}

generateKeywordTable();

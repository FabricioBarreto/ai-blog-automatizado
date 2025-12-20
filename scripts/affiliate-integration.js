import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎯 Base de datos de productos afiliados
const AFFILIATE_PRODUCTS = {
  "ai writing": {
    name: "Jasper AI",
    link: "https://www.amazon.com/...", // Tu link de afiliado
    description: "AI writing assistant",
    price: "$49/mo",
  },
  "productivity tools": {
    name: "Notion Ultimate Pack",
    link: "https://www.amazon.com/...",
    description: "Productivity templates",
    price: "$29",
  },
  "ai image": {
    name: "Midjourney Guide Book",
    link: "https://www.amazon.com/...",
    description: "Complete MJ tutorial",
    price: "$19.99",
  },
  // Agregar más productos según tu nicho
};

// 🔗 Componente de afiliado para insertar en artículos
const AFFILIATE_BOX_TEMPLATE = (product) => `
<div class="affiliate-box">
  <h4>🎁 Recommended Tool</h4>
  <p><strong>${product.name}</strong> - ${product.description}</p>
  <p>💰 Price: ${product.price}</p>
  <a href="${product.link}" target="_blank" rel="nofollow noopener" class="affiliate-btn">
    Check Price on Amazon →
  </a>
  <small>*As an Amazon Associate, I earn from qualifying purchases</small>
</div>
`;

// 📝 Función para enriquecer artículos con afiliados
async function enrichArticleWithAffiliates(articlePath) {
  try {
    console.log(`\n📄 Processing: ${path.basename(articlePath)}`);

    const content = fs.readFileSync(articlePath, "utf-8");

    // Extraer el tema del artículo
    const titleMatch = content.match(/title: "(.*?)"/);
    const title = titleMatch ? titleMatch[1] : "";

    console.log(`📌 Title: ${title}`);

    // 🤖 Usar IA para identificar productos relevantes
    const aiPrompt = `Given this article title: "${title}"

Available affiliate products:
${Object.entries(AFFILIATE_PRODUCTS)
  .map(([key, p]) => `- ${p.name}: ${p.description}`)
  .join("\n")}

Task: Select the 1-2 MOST relevant products for this article.
Return ONLY a JSON array of product keys, like: ["ai writing", "productivity tools"]

If no products are relevant, return: []`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0.3,
      max_tokens: 100,
    });

    const selectedKeys = JSON.parse(
      aiResponse.choices[0].message.content.trim()
    );

    if (selectedKeys.length === 0) {
      console.log("⚠️  No relevant products found");
      return;
    }

    console.log(`✅ Selected products: ${selectedKeys.join(", ")}`);

    // 🔗 Insertar cajas de afiliados
    let enrichedContent = content;

    selectedKeys.forEach((key, index) => {
      const product = AFFILIATE_PRODUCTS[key];
      const affiliateBox = AFFILIATE_BOX_TEMPLATE(product);

      // Insertar después del segundo H2 (mejor posición para conversión)
      const h2Matches = [...enrichedContent.matchAll(/^## /gm)];

      if (h2Matches.length >= 2) {
        const insertPosition = h2Matches[1].index;
        enrichedContent =
          enrichedContent.slice(0, insertPosition) +
          affiliateBox +
          "\n\n" +
          enrichedContent.slice(insertPosition);
      } else {
        // Si no hay suficientes H2, insertar antes de la conclusión
        enrichedContent = enrichedContent.replace(
          /## (Actionable )?Conclusion/i,
          `${affiliateBox}\n\n## Actionable Conclusion`
        );
      }
    });

    // 💾 Guardar archivo enriquecido
    fs.writeFileSync(articlePath, enrichedContent, "utf-8");
    console.log(
      `✅ Article enriched with ${selectedKeys.length} affiliate link(s)`
    );
  } catch (error) {
    console.error(`❌ Error processing ${articlePath}:`, error.message);
  }
}

// 🚀 Procesar todos los artículos existentes
async function processAllArticles() {
  const blogDir = path.join("src", "content", "blog");

  if (!fs.existsSync(blogDir)) {
    console.error("❌ Blog directory not found");
    return;
  }

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));

  console.log(`\n🎯 Found ${files.length} articles to process\n`);

  for (const file of files) {
    await enrichArticleWithAffiliates(path.join(blogDir, file));
    // Esperar un poco para no saturar la API
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n✅ All articles processed!");
}

// 🎬 Ejecutar
processAllArticles().catch(console.error);

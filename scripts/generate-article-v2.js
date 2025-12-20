import "dotenv/config";
import OpenAI from "openai";
import axios from "axios";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎯 Keywords optimizadas para afiliados (buyer intent)
const MONETIZABLE_KEYWORDS = [
  "best ai writing tools 2025",
  "notion templates for productivity review",
  "midjourney alternatives comparison",
  "chatgpt plus vs claude pro worth it",
  "ai productivity software for teams",
  "best ai chrome extensions for writers",
  "jasper ai review and pricing",
  "canva pro vs adobe express",
  "github copilot worth the price",
  "best ai tools for small business",
  "grammarly premium review 2025",
  "best ai image generators compared",
  "notion ai features review",
  "best automation tools for startups",
  "ai meeting assistants comparison",
];

// 💰 Base de productos afiliados (expandir según tu nicho)
const AFFILIATE_DATABASE = {
  "ai writing tools": [
    {
      name: "Jasper AI Annual Plan",
      amazonLink: "YOUR_AMAZON_AFFILIATE_LINK_1",
      price: "$49/month",
      description: "Professional AI writing assistant",
    },
    {
      name: "Grammarly Premium",
      amazonLink: "YOUR_AMAZON_AFFILIATE_LINK_2",
      price: "$12/month",
      description: "Advanced grammar and style checker",
    },
  ],
  "productivity tools": [
    {
      name: "Notion Ultimate Template Pack",
      amazonLink: "YOUR_AMAZON_AFFILIATE_LINK_3",
      price: "$29.99",
      description: "50+ professional Notion templates",
    },
  ],
  "ai image tools": [
    {
      name: "Midjourney Mastery Course",
      amazonLink: "YOUR_AMAZON_AFFILIATE_LINK_4",
      price: "$39.99",
      description: "Complete guide to AI image generation",
    },
  ],
};

const keyword =
  process.env.CUSTOM_KEYWORD ||
  MONETIZABLE_KEYWORDS[Math.floor(Math.random() * MONETIZABLE_KEYWORDS.length)];

async function generateMonetizedArticle() {
  try {
    console.log(`🎯 Generating monetized article for: ${keyword}`);
    const today = new Date().toISOString().split("T")[0];

    // 🤖 Paso 1: Identificar productos relevantes
    const productSelectionPrompt = `Keyword: "${keyword}"

Available product categories:
${Object.keys(AFFILIATE_DATABASE).join(", ")}

Return ONLY the most relevant category key (one word/phrase). No explanation.`;

    const categoryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: productSelectionPrompt }],
      temperature: 0.2,
      max_tokens: 20,
    });

    const selectedCategory = categoryResponse.choices[0].message.content.trim();
    const recommendedProducts = AFFILIATE_DATABASE[selectedCategory] || [];

    console.log(`💰 Selected category: ${selectedCategory}`);
    console.log(`📦 Products to promote: ${recommendedProducts.length}`);

    // 🎨 Paso 2: Generar artículo con estructura de afiliados
    const articlePrompt = `You are an expert affiliate marketer and SEO content writer.

Write a comprehensive, monetized blog post about: "${keyword}"

IMPORTANT: This article should naturally recommend products and include affiliate placements.

Structure:
1. **Hook Introduction** (120-150 words)
   - Start with a pain point or question
   - Mention that you'll recommend specific solutions
   - Set expectation for product reviews

2. **Main Content** (1,200-1,500 words)
   - 6-8 sections with H2 headers
   - Include comparison tables where relevant
   - Use phrases like "I recommend", "best option", "worth the investment"
   - Naturally transition to product recommendations
   - Include pros/cons for recommended tools
   
3. **Product Recommendations Section** (200 words)
   - Create a dedicated H2: "## Top Recommended Tools"
   - List ${recommendedProducts.length} product(s) with:
     * Brief description
     * Key features (3-4 bullet points)
     * Who it's best for
     * Use placeholder: [AFFILIATE_PRODUCT_1], [AFFILIATE_PRODUCT_2], etc.

4. **Buying Guide** (150 words)
   - H2: "## How to Choose the Right Tool"
   - 3-4 decision criteria
   - Budget considerations

5. **Conclusion with CTA** (100 words)
   - Summarize top recommendation
   - Clear call-to-action to check products
   - Mention money-back guarantees or free trials if common

SEO Requirements:
- Primary keyword: "${keyword}"
- Include "best", "review", "comparison", "worth it" naturally
- Meta description with CTA (max 155 characters)

Tone:
- Trustworthy and honest (mention pros AND cons)
- Personal ("I've tested", "In my experience")
- Helpful, not pushy
- Transparent about affiliate relationships

Output format:
---
title: "Compelling title with keyword (50-60 chars)"
description: "Meta with CTA, max 155 characters"
pubDate: ${today}
heroImage: "/images/placeholder.jpg"
tags: ["AI Tools", "Reviews", "Productivity"]
author: "AI Blog Team"
---
[Full article in Markdown]`;

    console.log("📝 Generating monetized article...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: articlePrompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    let articleContent = completion.choices[0].message.content;
    articleContent = fixYamlFrontmatter(articleContent);

    // 🔗 Paso 3: Insertar productos afiliados reales
    recommendedProducts.forEach((product, index) => {
      const placeholder = `[AFFILIATE_PRODUCT_${index + 1}]`;
      const affiliateBox = generateAffiliateBox(product);
      articleContent = articleContent.replace(placeholder, affiliateBox);
    });

    // 🖼️ Paso 4: Descargar imagen
    const imageQuery = keyword.split(" ").slice(0, 3).join(" ");
    const imageUrl = await downloadImageFromPexels(imageQuery);
    const finalContent = articleContent
      .replace('"/images/placeholder.jpg"', `"${imageUrl}"`)
      .replace("'/images/placeholder.jpg'", `"${imageUrl}"`);

    // 💾 Paso 5: Guardar
    const slug = keyword
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const filename = `${today}-${slug}.md`;
    const filepath = path.join("src", "content", "blog", filename);

    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, finalContent, "utf-8");

    console.log(`✅ Monetized article saved: ${filename}`);
    console.log(
      `💰 Affiliate products included: ${recommendedProducts.length}`
    );

    // 📊 Estimación de valor
    const avgCommission = 5; // $5 por venta promedio
    const conversionRate = 0.02; // 2% de conversión
    const monthlyTraffic = 1000; // Estimación conservadora
    const monthlyEarnings = monthlyTraffic * conversionRate * avgCommission;

    console.log(`
🎉 ARTICLE GENERATED!
📄 File: ${filename}
🔑 Keyword: ${keyword}
💰 Products: ${recommendedProducts.length}
📈 Est. monthly earnings (1K visits): $${monthlyEarnings.toFixed(2)}
    `);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

function generateAffiliateBox(product) {
  return `
<div class="affiliate-box">
  <h4>🎁 Recommended: ${product.name}</h4>
  <p>${product.description}</p>
  <p><strong>💰 Price:</strong> ${product.price}</p>
  <a href="${product.amazonLink}" target="_blank" rel="nofollow noopener sponsored" class="affiliate-btn">
    Check Current Price on Amazon →
  </a>
  <small>*We may earn a commission from purchases made through our links at no extra cost to you</small>
</div>
`;
}

function fixYamlFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return content;

  let frontmatter = frontmatterMatch[1];
  const bodyContent = content.replace(/^---\n[\s\S]*?\n---/, "");

  frontmatter = frontmatter.replace(/'/g, '"');
  frontmatter = frontmatter.replace(
    /^(title|description|heroImage|author):\s*(.+)$/gm,
    (match, key, value) => {
      const trimmedValue = value.trim();
      if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
        return match;
      }
      const cleanValue = trimmedValue.replace(/^['"]|['"]$/g, "");
      const escapedValue = cleanValue.replace(/"/g, '\\"');
      return `${key}: "${escapedValue}"`;
    }
  );

  return `---\n${frontmatter}\n---${bodyContent}`;
}

async function downloadImageFromPexels(query) {
  try {
    if (!process.env.PEXELS_API_KEY) {
      return "/images/default-hero.jpg";
    }

    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: { Authorization: process.env.PEXELS_API_KEY },
      params: { query, per_page: 1, orientation: "landscape" },
    });

    if (!response.data.photos || response.data.photos.length === 0) {
      return "/images/default-hero.jpg";
    }

    const photo = response.data.photos[0];
    const imageResponse = await axios.get(photo.src.large, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const filename = `${Date.now()}.jpg`;
    const filepath = path.join("public", "images", filename);
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, imageResponse.data);

    return `/images/${filename}`;
  } catch (error) {
    console.error("⚠️ Error downloading image:", error.message);
    return "/images/default-hero.jpg";
  }
}

generateMonetizedArticle().catch(console.error);

import axios from "axios";
import fs from "fs";

// Usar la API de Serper que ya tenés
const SERPER_API_KEY = process.env.SERPER_API_KEY;

async function analyzeCompetitors(mainKeyword) {
  try {
    const response = await axios.post(
      "https://google.serper.dev/search",
      {
        q: mainKeyword,
        num: 20,
        gl: "us",
        hl: "en",
      },
      {
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const competitors = response.data.organic || [];

    // Extraer keywords relacionadas
    const relatedSearches = response.data.relatedSearches || [];
    const peopleAlsoAsk = response.data.peopleAlsoAsk || [];

    console.log(`\n🎯 Keyword: "${mainKeyword}"`);
    console.log(`\n📊 Top 10 Competidores:`);
    competitors.slice(0, 10).forEach((c, i) => {
      console.log(`${i + 1}. ${c.title}`);
      console.log(`   ${c.link}`);
    });

    console.log(`\n🔍 Búsquedas relacionadas (keywords de cola larga):`);
    relatedSearches.forEach((r) => console.log(`- ${r.query}`));

    console.log(`\n❓ People Also Ask (ideas para H2):`);
    peopleAlsoAsk.forEach((q) => console.log(`- ${q.question}`));

    // Guardar para referencia
    const report = {
      mainKeyword,
      date: new Date().toISOString(),
      competitors: competitors.slice(0, 10),
      relatedSearches,
      peopleAlsoAsk,
    };

    fs.writeFileSync(
      `keyword-research-${mainKeyword.replace(/\s+/g, "-")}.json`,
      JSON.stringify(report, null, 2)
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Ejecutar para tus keywords principales
const MAIN_KEYWORDS = [
  "ia para productividad",
  "automatización con ia",
  "herramientas ia 2026",
  "building a second brain",
  "prompt engineering español",
];

(async () => {
  for (const keyword of MAIN_KEYWORDS) {
    await analyzeCompetitors(keyword);
    await new Promise((r) => setTimeout(r, 3000)); // Rate limiting
  }
})();

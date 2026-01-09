import axios from "axios";
import fs from "fs";
import "dotenv/config";

const SERPER_API_KEY = process.env.SERPER_API_KEY;

const TARGET_KEYWORDS = [
  "ia para productividad",
  "automatización con ia",
  "building a second brain español",
  "herramientas ia gratis",
  "prompt engineering tutorial",
];

async function trackCompetitors() {
  const report = {
    date: new Date().toISOString(),
    keywords: [],
  };

  for (const keyword of TARGET_KEYWORDS) {
    try {
      const response = await axios.post(
        "https://google.serper.dev/search",
        { q: keyword, num: 10, gl: "ar", hl: "es" },
        {
          headers: {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const results = response.data.organic || [];
      const myPosition = results.findIndex((r) =>
        r.link.includes("productivitylab.online")
      );

      const topCompetitors = results.slice(0, 5).map((r, i) => ({
        position: i + 1,
        title: r.title,
        domain: new URL(r.link).hostname,
        snippet: r.snippet,
      }));

      report.keywords.push({
        keyword,
        myPosition: myPosition >= 0 ? myPosition + 1 : "Not in top 10",
        topCompetitors,
      });

      console.log(`\n🎯 "${keyword}"`);
      console.log(
        `   Tu posición: ${myPosition >= 0 ? `#${myPosition + 1}` : "No visible"}`
      );
      console.log(`   Top 3:`);
      topCompetitors.slice(0, 3).forEach((c) => {
        console.log(`   ${c.position}. ${c.domain}`);
      });

      await new Promise((r) => setTimeout(r, 3000));
    } catch (error) {
      console.error(`Error con "${keyword}":`, error.message);
    }
  }

  const historyFile = "./competitor-tracking-history.json";
  let history = [];

  if (fs.existsSync(historyFile)) {
    history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  }

  history.push(report);

  if (history.length > 12) {
    history = history.slice(-12);
  }

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  console.log("\n✅ Reporte guardado en competitor-tracking-history.json");
}

trackCompetitors();

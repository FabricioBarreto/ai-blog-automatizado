import "dotenv/config";
import OpenAI from "openai";
import axios from "axios";

const tests = {
  async openai() {
    console.log("🧪 Testing OpenAI API...");
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY not found in .env");
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Say 'API works!'" }],
        max_tokens: 10,
      });

      const response = completion.choices[0].message.content;
      console.log("✅ OpenAI API working!");
      console.log(`   Response: ${response}`);
      return true;
    } catch (error) {
      console.error("❌ OpenAI API failed:", error.message);
      return false;
    }
  },

  async serper() {
    console.log("🧪 Testing Serper API...");
    try {
      if (!process.env.SERPER_API_KEY) {
        throw new Error("SERPER_API_KEY not found in .env");
      }

      const response = await axios.post(
        "https://google.serper.dev/search",
        { q: "test", num: 1 },
        {
          headers: {
            "X-API-KEY": process.env.SERPER_API_KEY,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("✅ Serper API working!");
      console.log(`   Found ${response.data.organic?.length || 0} results`);
      return true;
    } catch (error) {
      console.error("❌ Serper API failed:", error.message);
      return false;
    }
  },

  async pexels() {
    console.log("🧪 Testing Pexels API...");
    try {
      if (!process.env.PEXELS_API_KEY) {
        throw new Error("PEXELS_API_KEY not found in .env");
      }

      const response = await axios.get("https://api.pexels.com/v1/search", {
        headers: { Authorization: process.env.PEXELS_API_KEY },
        params: { query: "technology", per_page: 1 },
        timeout: 10000,
      });

      console.log("✅ Pexels API working!");
      console.log(`   Found ${response.data.photos?.length || 0} photos`);
      return true;
    } catch (error) {
      console.error("❌ Pexels API failed:", error.message);
      return false;
    }
  },
};

async function runTests(testName = "all") {
  console.log("🚀 Starting API tests...\n");

  const results = {};

  if (testName === "all") {
    for (const [name, test] of Object.entries(tests)) {
      results[name] = await test();
      console.log("");
    }
  } else if (tests[testName]) {
    results[testName] = await tests[testName]();
  } else {
    console.error(`❌ Unknown test: ${testName}`);
    console.log(`Available tests: ${Object.keys(tests).join(", ")}, all`);
    process.exit(1);
  }

  console.log("\n📊 Test Results:");
  console.log("================");
  Object.entries(results).forEach(([name, passed]) => {
    console.log(`${passed ? "✅" : "❌"} ${name}`);
  });

  const allPassed = Object.values(results).every((r) => r);
  console.log(
    `\n${allPassed ? "🎉 All tests passed!" : "⚠️  Some tests failed"}`
  );

  process.exit(allPassed ? 0 : 1);
}

const testName = process.argv[2] || "all";
runTests(testName);

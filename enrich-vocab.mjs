import fs from "fs";
import path from "path";
import readline from "readline";

const DATA_DIR = "/Users/andysimac/Desktop/Desktop/Work/Web Design Journey/MyParadiseEnglish/src/data";
const BOOKS = ["oxford-discover-book1.json","oxford-discover-book2.json","oxford-discover-book3.json","oxford-discover-book4.json","oxford-discover-book5.json"];

async function askApiKey() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => { rl.question("Paste your Anthropic API key: ", (answer) => { rl.close(); resolve(answer.trim()); }); });
}

async function enrichWords(words, bookNum, unitNum, apiKey) {
  const prompt = `For each word, give a simple English definition (6-8 words, for kids age 6-12) and a Traditional Chinese translation. Words: ${words.join(", ")}. Respond ONLY with a JSON array like: [{"word":"family","definition_en":"people who live and love together","definition_zh":"家人"}]`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
  });
  const data = await res.json();
  const text = data.content[0].text.trim().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

function getUnits(bookData) {
  if (Array.isArray(bookData)) return bookData;
  if (bookData.units) return bookData.units;
  return [];
}

function setUnits(bookData, units) {
  if (Array.isArray(bookData)) return units;
  return { ...bookData, units };
}

async function main() {
  console.log("MPE Vocab Enrichment Script");
  const apiKey = await askApiKey();
  if (!apiKey.startsWith("sk-ant-")) { console.error("Invalid API key"); process.exit(1); }

  for (const filename of BOOKS) {
    const filepath = path.join(DATA_DIR, filename);
    const bookNum = filename.match(/book(\d)/)[1];
    console.log("\nProcessing " + filename + "...");
    let bookData = JSON.parse(fs.readFileSync(filepath, "utf-8"));
    const units = getUnits(bookData);

    for (const unit of units) {
      const words = unit.vocabulary?.words;
      if (!Array.isArray(words)) continue;
      const needsEnrichment = words.filter(w => typeof w === "string");
      if (needsEnrichment.length === 0) { console.log("  Unit " + unit.unit + " already done"); continue; }
      process.stdout.write("  Unit " + unit.unit + " enriching " + needsEnrichment.length + " words...");
      try {
        const results = await enrichWords(needsEnrichment, bookNum, unit.unit, apiKey);
        const map = {};
        results.forEach(r => { map[r.word] = r; });
        unit.vocabulary.words = words.map(w => map[w] || { word: w, definition_en: "", definition_zh: "" });
        console.log(" done");
        await new Promise(r => setTimeout(r, 400));
      } catch(e) { console.log(" ERROR: " + e.message); }
    }

    fs.writeFileSync(filepath, JSON.stringify(setUnits(bookData, units), null, 2));
    console.log("Saved " + filename);
  }
  console.log("\nAll done!");
}

main().catch(e => { console.error(e.message); process.exit(1); });

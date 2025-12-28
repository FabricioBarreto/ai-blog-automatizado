import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanupUnusedImages() {
  const blogDir = path.join(__dirname, "../src/content/blog");
  const imagesDir = path.join(__dirname, "../public/images");

  if (!fs.existsSync(imagesDir)) {
    console.log("⚠️  Images directory not found");
    return;
  }

  const images = fs
    .readdirSync(imagesDir)
    .filter((f) => /\.(jpg|png|webp)$/.test(f) && f !== "default-hero.jpg");

  if (!fs.existsSync(blogDir)) {
    console.log("⚠️  Blog directory not found");
    return;
  }

  // Leer todos los artículos
  const articles = fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => fs.readFileSync(path.join(blogDir, f), "utf-8"))
    .join("\n");

  const unusedImages = [];

  images.forEach((image) => {
    if (!articles.includes(image)) {
      unusedImages.push(image);
    }
  });

  if (unusedImages.length === 0) {
    console.log("✅ No unused images found!");
    return;
  }

  console.log(`🗑️  Found ${unusedImages.length} unused images:\n`);
  unusedImages.forEach((img) => console.log(`   - ${img}`));

  console.log("\n⚠️  To delete them, uncomment the deletion code in the script");

  // Descomentar para eliminar:
  // unusedImages.forEach((img) => {
  //   fs.unlinkSync(path.join(imagesDir, img));
  //   console.log(`   Deleted: ${img}`);
  // });
}

cleanupUnusedImages();
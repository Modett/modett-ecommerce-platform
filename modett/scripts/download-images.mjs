import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const heroImages = [
  { id: 'photo-1544441892-794166f1e3be', name: 'hero.jpg', width: 1920 },
  { id: 'photo-1617127365659-c47fa864d8bc', name: 'brand-philosophy.jpg', width: 800 },
  { id: 'photo-1490481651871-ab68de25d43d', name: 'banner-1.jpg', width: 1920 },
  { id: 'photo-1483985988355-763728e1935b', name: 'banner-2.jpg', width: 1920 },
];

const productImages = [
  { id: 'photo-1596783074918-c84cb06531ca', name: 'product-1.jpg', width: 1200 },
  { id: 'photo-1594633313593-bab3825d0caf', name: 'product-2.jpg', width: 1200 },
  { id: 'photo-1591369822096-ffd140ec948f', name: 'product-3.jpg', width: 1200 },
  { id: 'photo-1595777457583-95e059d581b8', name: 'product-4.jpg', width: 1200 },
  { id: 'photo-1434389677669-e08b4cac3105', name: 'product-5.jpg', width: 1200 },
  { id: 'photo-1583496661160-fb5886a0aaaa', name: 'product-6.jpg', width: 1200 },
  { id: 'photo-1566174053879-31528523f8ae', name: 'product-7.jpg', width: 1200 },
  { id: 'photo-1594633312681-425c7b97ccd1', name: 'product-8.jpg', width: 1200 },
  { id: 'photo-1618886614638-80e3c103d31a', name: 'product-9.jpg', width: 1200 },
  { id: 'photo-1620799140408-edc6dcb6d633', name: 'product-10.jpg', width: 1200 },
];

const productsDir = path.join(__dirname, '../apps/web/public/images/products');
const heroDir = path.join(__dirname, '../apps/web/public/images');

async function downloadImage(url, filePath) {
  try {
    const filename = path.basename(filePath);
    console.log(`Downloading ${filename}...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`✓ Saved ${filename}`);
  } catch (error) {
    const filename = path.basename(filePath);
    console.error(`✗ Error downloading ${filename}:`, error.message);
  }
}

async function downloadAll() {
  console.log('Starting image downloads...\n');

  // Download hero/banner images
  console.log('📥 Downloading hero and banner images...');
  for (const image of heroImages) {
    const url = `https://images.unsplash.com/${image.id}?w=${image.width}&q=80`;
    const filePath = path.join(heroDir, image.name);
    await downloadImage(url, filePath);
  }

  // Download product images
  console.log('\n📥 Downloading product images...');
  for (const image of productImages) {
    const url = `https://images.unsplash.com/${image.id}?w=${image.width}&q=80`;
    const filePath = path.join(productsDir, image.name);
    await downloadImage(url, filePath);
  }

  console.log('\n✅ All downloads complete!');
}

downloadAll();

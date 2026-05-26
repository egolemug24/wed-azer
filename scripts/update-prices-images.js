const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const stepsPath = 'C:/Users/Пользователь/.gemini/antigravity/brain/bd36bb34-a9df-4c25-a2b8-b6d0dff2fb21/.system_generated/steps';

// Helper to extract JSON from fetched content md files
function readJSONFromMd(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const delimiter = '---';
    const index = content.indexOf(delimiter);
    if (index === -1) {
      return [];
    }
    const jsonStr = content.substring(index + delimiter.length).trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return [];
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadImage(url, destPath, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        const options = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://deligame.ru/'
          },
          timeout: 15000 // 15s timeout
        };
        const req = https.get(url, options, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Status code ${response.statusCode}`));
            return;
          }
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        });
        req.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
        req.on('timeout', () => {
          req.destroy();
          fs.unlink(destPath, () => {});
          reject(new Error('Timeout'));
        });
      });
      return true; // Success
    } catch (err) {
      console.warn(`  Attempt ${i + 1} failed for ${url}: ${err.message}`);
      if (i === retries - 1) return false;
      await sleep(2000);
    }
  }
  return false;
}

async function main() {
  console.log('Loading JSON data...');
  const catalog = [
    ...readJSONFromMd(path.join(stepsPath, '2116/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2136/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2137/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2138/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2139/content.md'))
  ];

  console.log(`Loaded ${catalog.length} games from catalog.`);

  const imgDir = path.join(__dirname, '../public/img/games');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  let updatedCount = 0;

  for (let i = 0; i < catalog.length; i++) {
    const game = catalog[i];
    
    let sku = 'unknown';
    const skuMatch = game.image.match(/product-([^/]+)/);
    if (skuMatch && skuMatch[1]) {
      sku = skuMatch[1];
    } else {
      continue;
    }

    const localImageName = `${sku}.jpg`;
    const localImagePath = path.join(imgDir, localImageName);
    let dbImagePath = `/img/games/${localImageName}`;
    const remoteImageUrl = `https://deligame.ru${game.image}`;

    let needsDownload = true;
    if (fs.existsSync(localImagePath)) {
      const stats = fs.statSync(localImagePath);
      if (stats.size > 0) {
        needsDownload = false;
      }
    }

    if (needsDownload) {
      console.log(`Downloading missing image for: ${game.title}`);
      const success = await downloadImage(remoteImageUrl, localImagePath);
      if (!success) {
        dbImagePath = remoteImageUrl;
      }
      await sleep(500); // polite delay
    }

    let price = 1990;
    if (game.price) {
      const parsed = parseFloat(game.price.replace(/[^\d]/g, ''));
      if (!isNaN(parsed)) {
        price = parsed;
      }
    }

    try {
      const dbProd = await prisma.product.findUnique({ where: { id: sku } });
      if (dbProd) {
        if (dbProd.price !== price || dbProd.image !== dbImagePath) {
          await prisma.product.update({
            where: { id: sku },
            data: {
              price: price,
              image: dbImagePath
            }
          });
          updatedCount++;
          console.log(`Updated price/image for ${game.title} (Price: ${price})`);
        }
      } else {
        console.log(`Product not found in DB by SKU: ${sku}`);
      }
    } catch (err) {
      console.error(`Error updating ${game.title}:`, err.message);
    }
  }

  console.log(`Done. Updated ${updatedCount} products.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

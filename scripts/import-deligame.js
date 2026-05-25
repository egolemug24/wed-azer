const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const stepsPath = 'C:/Users/Пользователь/.gemini/antigravity/brain/bd36bb34-a9df-4c25-a2b8-b6d0dff2fb21/.system_generated/steps';

// Helper to extract JSON from fetched content md files
function readJSONFromMd(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const delimiter = '---';
  const index = content.indexOf(delimiter);
  if (index === -1) {
    throw new Error(`Delimiter not found in ${filePath}`);
  }
  const jsonStr = content.substring(index + delimiter.length).trim();
  return JSON.parse(jsonStr);
}

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Download image helper with custom User-Agent and retries
async function downloadImage(url, destPath, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        const options = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          timeout: 10000 // 10s timeout
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
      return; // Success
    } catch (err) {
      console.warn(`  Attempt ${i + 1} failed for ${url}: ${err.message}`);
      if (i === retries - 1) throw err;
      await sleep(2000); // Wait 2s before retry
    }
  }
}

// Category definition helper
const categoriesDef = [
  { name: 'Новинки', slug: 'new' },
  { name: 'Предзаказы', slug: 'preorders' },
  { name: 'Шутеры', slug: 'shooters' },
  { name: 'Спорт', slug: 'sports' },
  { name: 'Гонки', slug: 'racing' },
  { name: 'Симуляторы', slug: 'simulators' },
  { name: 'На двоих', slug: 'coop' },
  { name: 'Игры для VR', slug: 'vr' },
  { name: 'Игры PS4 / PS5', slug: 'games' }
];

async function main() {
  console.log('Loading JSON data...');
  const catalog = [
    ...readJSONFromMd(path.join(stepsPath, '2116/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2136/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2137/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2138/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2139/content.md'))
  ];
  const novinki = readJSONFromMd(path.join(stepsPath, '2118/content.md')); // 17 (Новинки)
  const predzakazy = readJSONFromMd(path.join(stepsPath, '2119/content.md')); // 23 (Предзаказы)

  console.log(`Loaded ${catalog.length} games from catalog.`);
  console.log(`Loaded ${novinki.length} games from Novinki.`);
  console.log(`Loaded ${predzakazy.length} games from Predzakazy.`);

  // Create sets of URLs for fast lookup
  const novinkiUrls = new Set(novinki.map(g => g.url));
  const predzakazyUrls = new Set(predzakazy.map(g => g.url));

  // Initialize categories in the DB
  console.log('Upserting categories...');
  const dbCategories = {};
  for (const cat of categoriesDef) {
    let dbCat = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: cat.slug },
          { name: cat.name }
        ]
      }
    });

    if (dbCat) {
      dbCat = await prisma.category.update({
        where: { id: dbCat.id },
        data: { name: cat.name, slug: cat.slug }
      });
    } else {
      dbCat = await prisma.category.create({
        data: { name: cat.name, slug: cat.slug }
      });
    }
    dbCategories[cat.slug] = dbCat.id;
  }

  // Ensure output directory exists
  const imgDir = path.join(__dirname, '../public/img/games');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  let importedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < catalog.length; i++) {
    const game = catalog[i];
    console.log(`[${i + 1}/${catalog.length}] Processing "${game.title}"...`);

    // Parse image SKU for unique naming
    let sku = 'unknown';
    const skuMatch = game.image.match(/product-([^/]+)/);
    if (skuMatch && skuMatch[1]) {
      sku = skuMatch[1];
    } else {
      sku = `game-${i}-${Date.now()}`;
    }

    const localImageName = `${sku}.jpg`;
    const localImagePath = path.join(imgDir, localImageName);
    let dbImagePath = `/img/games/${localImageName}`;

    // Download image if it doesn't exist
    if (!fs.existsSync(localImagePath)) {
      try {
        const remoteImageUrl = `https://deligame.ru${game.image}`;
        console.log(`  Downloading image for ${game.title}...`);
        await downloadImage(remoteImageUrl, localImagePath);
      } catch (err) {
        console.error(`  Failed to download image for ${game.title}:`, err.message);
        // Fallback to remote absolute URL
        dbImagePath = `https://deligame.ru${game.image}`;
        console.log(`  Falling back to remote URL for ${game.title}`);
      }
    }

    // Determine category
    let categorySlug = 'games'; // Default
    if (novinkiUrls.has(game.url)) {
      categorySlug = 'new';
    } else if (predzakazyUrls.has(game.url)) {
      categorySlug = 'preorders';
    } else {
      const desc = (game.description || '').toLowerCase();
      const title = (game.title || '').toLowerCase();

      if (title.includes('vr') || desc.includes('vr') || desc.includes('виртуальн')) {
        categorySlug = 'vr';
      } else if (desc.includes('на двоих') || desc.includes('двоих') || desc.includes('совмест') || desc.includes('коопер')) {
        categorySlug = 'coop';
      } else if (title.includes('fifa') || title.includes('ea sports') || title.includes('ufc') || title.includes('nba') || title.includes('nhl') || title.includes('madden') || desc.includes('спорт') || desc.includes('футбол') || desc.includes('хоккей')) {
        categorySlug = 'sports';
      } else if (title.includes('nfs') || title.includes('need for speed') || title.includes('crew') || desc.includes('гонки') || desc.includes('машин') || desc.includes('rally')) {
        categorySlug = 'racing';
      } else if (title.includes('shooter') || title.includes('call of duty') || title.includes('battlefield') || desc.includes('шутер') || desc.includes('стреля')) {
        categorySlug = 'shooters';
      } else if (desc.includes('симулятор') || desc.includes('simulator')) {
        categorySlug = 'simulators';
      }
    }

    const categoryId = dbCategories[categorySlug];

    // Parse price
    let price = 1990;
    if (game.price) {
      const parsed = parseFloat(game.price.replace(/[^\d]/g, ''));
      if (!isNaN(parsed)) {
        price = parsed;
      }
    }

    // Parse platforms
    let platforms = [];
    try {
      const parsedPlat = JSON.parse(game.platforms);
      if (Array.isArray(parsedPlat)) {
        if (parsedPlat.includes('PS4')) platforms.push('PS4');
        if (parsedPlat.includes('PS5')) platforms.push('PS5');
      }
    } catch (_) {
      const str = String(game.platforms || '').toUpperCase();
      if (str.includes('PS4')) platforms.push('PS4');
      if (str.includes('PS5')) platforms.push('PS5');
    }
    if (platforms.length === 0) {
      platforms = ['PS5'];
    }

    // Insert or update in database
    try {
      await prisma.product.upsert({
        where: { id: sku }, // Use SKU as stable ID
        update: {
          name: game.title,
          description: game.description || game.title,
          price: price,
          image: dbImagePath,
          categoryId: categoryId,
          platform: platforms,
          isAvailable: true
        },
        create: {
          id: sku,
          name: game.title,
          description: game.description || game.title,
          price: price,
          image: dbImagePath,
          categoryId: categoryId,
          platform: platforms,
          isAvailable: true,
          rating: 5.0
        }
      });
      importedCount++;
    } catch (dbErr) {
      console.error(`  Failed to save "${game.title}" to DB:`, dbErr.message);
      skippedCount++;
    }
    await sleep(300); // 300ms delay between games to prevent Cloudflare ban
  }

  console.log('\n--- Import Complete ---');
  console.log(`Successfully imported/updated: ${importedCount} games`);
  console.log(`Skipped/failed: ${skippedCount} games`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

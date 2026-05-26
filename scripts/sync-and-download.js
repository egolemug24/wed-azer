const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper to extract JSON from fetched content md files
function readJSONFromMd(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const delimiter = '---';
  const index = content.indexOf(delimiter);
  if (index === -1) return [];
  const jsonStr = content.substring(index + delimiter.length).trim();
  return JSON.parse(jsonStr);
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

// Helper to extract SKU
function getSku(game, index) {
  if (game.image) {
    const productMatch = game.image.match(/product-([^/]+)/);
    if (productMatch && productMatch[1]) return productMatch[1];
    const conceptMatch = game.image.match(/concept-([^/]+)/);
    if (conceptMatch && conceptMatch[1]) return `concept-${conceptMatch[1]}`;
  }
  const urlMatch = game.url.match(/product\/([^/]+)/);
  if (urlMatch && urlMatch[1]) return urlMatch[1];
  return `game-imported-${index}`;
}

// PowerShell download helper
function downloadWithPowerShell(url, destPath) {
  try {
    // Escape single quotes for PowerShell
    const escapedUrl = url.replace(/'/g, "''");
    const escapedDest = destPath.replace(/'/g, "''");
    const cmd = `powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' -Uri '${escapedUrl}' -OutFile '${escapedDest}'"`;
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch (err) {
    console.error(`  PowerShell download failed for ${url}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('1. Deleting 4 mock products from seed-catalog...');
  const mockIds = [
    'cmpk0xto8000753rlyzpw05c9',
    'cmpk0xu0z000953rltb336yyo',
    'cmpk0xu6n000b53rlixju04hl',
    'cmpk0xuco000d53rl183yvaxq'
  ];
  const deleteMockRes = await prisma.product.deleteMany({
    where: { id: { in: mockIds } }
  });
  console.log(`   Deleted ${deleteMockRes.count} mock products.`);

  console.log('2. Initializing Categories...');
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

  console.log('3. Loading all games from live pages...');
  const games = [];
  const steps = ['462', '470', '472', '474', '476'];
  for (const s of steps) {
    const p = `C:/Users/Пользователь/.gemini/antigravity/brain/65d9cd3c-fa23-4930-b585-16622ce754f9/.system_generated/steps/${s}/content.md`;
    if (fs.existsSync(p)) {
      games.push(...readJSONFromMd(p));
    }
  }
  console.log(`   Loaded ${games.length} total live games.`);

  // Load collections to see what games are in novinki/predzakazy
  // We can also identify from titles/descriptions
  const imgDir = path.join(__dirname, '../public/img/games');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  let successCount = 0;
  let errorCount = 0;

  console.log('4. Syncing games to DB and downloading cover art...');
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const sku = getSku(game, i);
    const localImageName = `${sku}.jpg`;
    const localImagePath = path.join(imgDir, localImageName);
    const dbImagePath = `/img/games/${localImageName}`;

    console.log(`[${i + 1}/${games.length}] Processing "${game.title}" (SKU: ${sku})`);

    // Parse price
    let price = 1990;
    if (game.price) {
      const parsed = parseFloat(game.price.replace(/[^\d]/g, ''));
      if (!isNaN(parsed)) {
        price = parsed;
      }
    }

    // Determine category
    let categorySlug = 'games'; // Default
    const desc = (game.description || '').toLowerCase();
    const title = (game.title || '').toLowerCase();

    if (title.includes('vr') || desc.includes('vr') || desc.includes('виртуальн')) {
      categorySlug = 'vr';
    } else if (desc.includes('на двоих') || desc.includes('двоих') || desc.includes('совмест') || desc.includes('коопер')) {
      categorySlug = 'coop';
    } else if (title.includes('fifa') || title.includes('ea sports') || title.includes('fc 2') || title.includes('ufc') || title.includes('nba') || title.includes('nhl') || title.includes('madden') || desc.includes('спорт') || desc.includes('футбол') || desc.includes('хоккей')) {
      categorySlug = 'sports';
    } else if (title.includes('nfs') || title.includes('need for speed') || title.includes('crew') || desc.includes('гонки') || desc.includes('машин') || desc.includes('rally')) {
      categorySlug = 'racing';
    } else if (title.includes('shooter') || title.includes('call of duty') || title.includes('battlefield') || desc.includes('шутер') || desc.includes('стреля')) {
      categorySlug = 'shooters';
    } else if (desc.includes('симулятор') || desc.includes('simulator')) {
      categorySlug = 'simulators';
    }

    const categoryId = dbCategories[categorySlug];

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

    // Download image if it doesn't exist
    if (!fs.existsSync(localImagePath)) {
      const remoteImageUrl = `https://deligame.ru${game.image}`;
      console.log(`   Downloading image: ${remoteImageUrl}`);
      const success = downloadWithPowerShell(remoteImageUrl, localImagePath);
      if (!success) {
        // Retry once after 1 second
        console.log('   Retrying image download...');
        const successRetry = downloadWithPowerShell(remoteImageUrl, localImagePath);
        if (!successRetry) {
          console.error(`   Failed to download image for ${game.title}`);
          errorCount++;
        }
      }
    }

    // Upsert in database
    try {
      await prisma.product.upsert({
        where: { id: sku },
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
      successCount++;
    } catch (dbErr) {
      console.error(`   Failed to save product in DB:`, dbErr.message);
      errorCount++;
    }
  }

  console.log('\n--- Sync and Download Complete ---');
  console.log(`Successfully synced products: ${successCount}`);
  console.log(`Errors/failed: ${errorCount}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

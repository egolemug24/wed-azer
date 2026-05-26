const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Read fresh full catalog from step 991
const freshCatalogPath = 'C:/Users/Пользователь/.gemini/antigravity/brain/65d9cd3c-fa23-4930-b585-16622ce754f9/.system_generated/steps/991/content.md';

function readJSONFromMd(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const index = content.indexOf('---');
    if (index === -1) return [];
    return JSON.parse(content.substring(index + 3).trim());
  } catch (err) {
    console.error('Error reading:', err.message);
    return [];
  }
}

function extractSku(imageStr) {
  const m = imageStr.match(/product-([^/]+)/);
  if (m) return m[1];
  const c = imageStr.match(/concept-([^/]+)/);
  if (c) return 'concept-' + c[1];
  return null;
}

// Problematic products still having wrong prices
const problemIds = [
  'UP1001-PPSA01494_00-000000000000OAK2',    // Borderlands 4 - 58₽
  'EP4399-PPSA19644_00-FARMSIMULAT25PS5',     // Farming Simulator 25 - 85₽
  'EP4133-PPSA10695_00-ATOMICHEARTGLDED',     // Atomic Heart Standart - 175₽
  'EP3969-PPSA11386_00-007FIRSTLIGHT000',     // 007 First Light - 175₽
  'EP4133-PPSA10695_00-ATOMICHEARTPRMED',     // Atomic Heart Premium - 175₽
  'EP1018-PPSA01865_00-LSWTSSBNDLEDELUX',    // LEGO SW - 175₽
  'EP0102-PPSA07412_00-RE4RMAINGAME0000',    // RE4 Remake - 175₽
  'EP0177-PPSA02384_00-LIKEADRAGON00000',    // Yakuza - 175₽
  'EP0177-PPSA10873_00-APPLICATION00000',    // Persona 3 - 248₽
];

async function main() {
  const catalog = readJSONFromMd(freshCatalogPath);
  console.log(`Fresh full catalog: ${catalog.length} games`);

  // Build price map
  const priceMap = new Map();
  for (const g of catalog) {
    const sku = extractSku(g.image || '');
    if (!sku) continue;
    const price = g.priceRubValue ? Math.round(g.priceRubValue) :
                  parseInt((g.price || '').replace(/[^\d]/g, ''), 10) || 0;
    if (price > 0) {
      priceMap.set(sku, { price, title: g.title });
    }
  }

  // Check problem products
  console.log('\n=== Checking problem products in fresh catalog ===');
  for (const id of problemIds) {
    const found = priceMap.get(id);
    if (found) {
      console.log(`  FOUND: ${found.title} -> ${found.price}₽`);
    } else {
      console.log(`  NOT FOUND: ${id}`);
    }
  }

  // Update prices where found with different value
  let updated = 0;
  const products = await prisma.product.findMany({
    where: { id: { in: problemIds } }
  });

  for (const prod of products) {
    const found = priceMap.get(prod.id);
    if (found && found.price !== prod.price) {
      console.log(`\n  UPDATING: "${prod.name}": ${prod.price} -> ${found.price}`);
      await prisma.product.update({ where: { id: prod.id }, data: { price: found.price } });
      updated++;
    }
  }

  console.log(`\nUpdated: ${updated}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

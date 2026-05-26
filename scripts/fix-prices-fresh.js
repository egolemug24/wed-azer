const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fresh catalog from step 945 (today's fetch)
const freshCatalogPath = 'C:/Users/Пользователь/.gemini/antigravity/brain/65d9cd3c-fa23-4930-b585-16622ce754f9/.system_generated/steps/945/content.md';

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
  const c = imageStr.match(/concept-([^/]+)\//);
  if (c) return 'concept-' + c[1];
  return null;
}

async function main() {
  const catalog = readJSONFromMd(freshCatalogPath);
  console.log(`Fresh catalog: ${catalog.length} games`);

  // Build price map
  const priceMap = new Map();
  for (const g of catalog) {
    const sku = extractSku(g.image || '');
    if (!sku) continue;
    const price = g.priceRubValue ? Math.round(g.priceRubValue) : 
                  parseInt((g.price || '').replace(/[^\d]/g, ''), 10);
    if (price > 0) {
      priceMap.set(sku, { price, title: g.title });
    }
  }
  console.log(`Unique SKUs: ${priceMap.size}`);

  // Get all cheap products
  const cheap = await prisma.product.findMany({
    where: { price: { lt: 1000 } },
    orderBy: { price: 'asc' }
  });
  
  console.log(`\nProducts < 1000₽: ${cheap.length}`);
  let updated = 0;

  for (const prod of cheap) {
    const found = priceMap.get(prod.id);
    if (found && found.price > prod.price) {
      console.log(`  FIX: "${prod.name}": ${prod.price} -> ${found.price}`);
      await prisma.product.update({ where: { id: prod.id }, data: { price: found.price } });
      updated++;
    } else {
      // Check if this is a genuinely cheap product from deligame
      const apiEntry = catalog.find(g => extractSku(g.image || '') === prod.id);
      if (apiEntry) {
        console.log(`  [API CONFIRMS] "${prod.name}" = ${prod.price}₽ (price: "${apiEntry.price}", priceRubValue: ${apiEntry.priceRubValue})`);
      } else {
        console.log(`  [NOT IN API] "${prod.name}" (${prod.id}) = ${prod.price}₽`);
      }
    }
  }

  console.log(`\nFixed: ${updated}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

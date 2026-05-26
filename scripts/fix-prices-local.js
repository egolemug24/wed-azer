const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stepsPath = 'C:/Users/Пользователь/.gemini/antigravity/brain/bd36bb34-a9df-4c25-a2b8-b6d0dff2fb21/.system_generated/steps';

function readJSONFromMd(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const delimiter = '---';
    const index = content.indexOf(delimiter);
    if (index === -1) return [];
    const jsonStr = content.substring(index + delimiter.length).trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return [];
  }
}

function extractSku(imageStr) {
  const productMatch = imageStr.match(/product-([^/]+)/);
  if (productMatch) return productMatch[1];
  const conceptMatch = imageStr.match(/concept-([^/]+)\//);
  if (conceptMatch) return 'concept-' + conceptMatch[1];
  return null;
}

async function main() {
  // Build price map from catalog (steps 2116, 2136-2139)
  // These use the standard catalog API format with priceRubValue
  const catalogSteps = ['2116', '2136', '2137', '2138', '2139'];
  const catalogMap = new Map(); // sku -> priceRubValue

  console.log('Reading catalog data...');
  for (const step of catalogSteps) {
    const filePath = path.join(stepsPath, step, 'content.md');
    if (!fs.existsSync(filePath)) { console.log(`  Step ${step} not found`); continue; }
    const games = readJSONFromMd(filePath);
    for (const g of games) {
      const sku = extractSku(g.image || '');
      if (!sku) continue;
      // Use priceRubValue if available, otherwise parse price
      let price = null;
      if (g.priceRubValue) {
        price = Math.round(g.priceRubValue);
      } else if (g.price) {
        const cleaned = g.price.replace(/[^\d]/g, '');
        const num = parseInt(cleaned, 10);
        if (!isNaN(num) && num > 0) price = num;
      }
      if (price && price > 100) {
        catalogMap.set(sku, { price, title: g.title, source: `catalog-${step}` });
      }
    }
  }
  console.log(`  Catalog SKUs: ${catalogMap.size}`);

  // Build price map from share sections (steps 2118, 2119)
  // These use share_price_ps5_with_value as the full catalog price
  const shareSections = [
    { step: '2118', name: 'Новинки' },
    { step: '2119', name: 'Предзаказы' }
  ];
  const shareMap = new Map(); // sku -> { price, title }

  console.log('\nReading share section data...');
  for (const { step, name } of shareSections) {
    const filePath = path.join(stepsPath, step, 'content.md');
    if (!fs.existsSync(filePath)) { console.log(`  Step ${step} not found`); continue; }
    const games = readJSONFromMd(filePath);
    for (const g of games) {
      const sku = extractSku(g.image || '');
      if (!sku) continue;
      
      // For share sections: use share_price_ps5_with_value (price WITH sharing subscription)
      // This is the standard catalog price that deligame charges
      let price = null;
      if (g.share_price_ps5_with_value) {
        price = Math.round(g.share_price_ps5_with_value);
      } else if (g.share_price_ps5_without_value) {
        // Fallback to without-subscription price
        price = Math.round(g.share_price_ps5_without_value);
      } else if (g.priceRubValue) {
        price = Math.round(g.priceRubValue);
      }
      
      if (price && price > 100) {
        shareMap.set(sku, { price, title: g.title, source: name });
      }
    }
    console.log(`  ${name} SKUs: ${shareMap.size}`);
  }

  // Merge: catalog takes priority, then share
  const allPrices = new Map([...shareMap, ...catalogMap]);
  console.log(`\nTotal unique SKUs with prices: ${allPrices.size}`);

  // Update DB
  const products = await prisma.product.findMany();
  console.log(`Total products in DB: ${products.length}`);

  let updatedCount = 0;
  let notFoundCount = 0;

  for (const prod of products) {
    const apiData = allPrices.get(prod.id);
    if (apiData && apiData.price !== prod.price) {
      console.log(`  UPDATE: "${prod.name}": ${prod.price} -> ${apiData.price} (${apiData.source})`);
      await prisma.product.update({
        where: { id: prod.id },
        data: { price: apiData.price }
      });
      updatedCount++;
    } else if (!apiData) {
      notFoundCount++;
      if (prod.price < 500) {
        console.log(`  LOW PRICE NOT IN DATA: "${prod.name}" (${prod.id}) = ${prod.price}₽`);
      }
    }
  }

  console.log('\n=== RESULTS ===');
  console.log(`Updated: ${updatedCount}`);
  console.log(`Not found in cached data: ${notFoundCount}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

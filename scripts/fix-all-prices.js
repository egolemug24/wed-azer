const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Read fresh cached catalog data
const freshStepsPath = 'C:/Users/Пользователь/.gemini/antigravity/brain/65d9cd3c-fa23-4930-b585-16622ce754f9/.system_generated/steps';
const oldStepsPath = 'C:/Users/Пользователь/.gemini/antigravity/brain/bd36bb34-a9df-4c25-a2b8-b6d0dff2fb21/.system_generated/steps';

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

async function main() {
  // Read fresh catalog (step 856 from current conversation)
  const freshCatalog = readJSONFromMd(path.join(freshStepsPath, '856/content.md'));
  console.log(`Fresh catalog: ${freshCatalog.length} games`);

  // Read old data from all sources
  const oldCatalog = [
    ...readJSONFromMd(path.join(oldStepsPath, '2116/content.md')),
    ...readJSONFromMd(path.join(oldStepsPath, '2136/content.md')),
    ...readJSONFromMd(path.join(oldStepsPath, '2137/content.md')),
    ...readJSONFromMd(path.join(oldStepsPath, '2138/content.md')),
    ...readJSONFromMd(path.join(oldStepsPath, '2139/content.md'))
  ];
  const novinki = readJSONFromMd(path.join(oldStepsPath, '2118/content.md'));
  const predzakazy = readJSONFromMd(path.join(oldStepsPath, '2119/content.md'));
  console.log(`Old catalog: ${oldCatalog.length}, Novinki: ${novinki.length}, Predzakazy: ${predzakazy.length}`);

  // Build comprehensive price map by URL
  const priceByUrl = new Map();
  const priceBySku = new Map();

  function extractSku(imageStr) {
    const productMatch = imageStr.match(/product-([^/]+)/);
    if (productMatch) return productMatch[1];
    const conceptMatch = imageStr.match(/concept-([^/]+)/);
    if (conceptMatch) return 'concept-' + conceptMatch[1];
    return null;
  }

  function extractSkuFromUrl(url) {
    const m = url.match(/product\/([A-Z0-9]+-[A-Z0-9_]+-[A-Z0-9]+)/i);
    if (m) return m[1];
    const c = url.match(/concept\/(\d+)/);
    if (c) return 'concept-' + c[1];
    return null;
  }

  // Process fresh catalog
  for (const g of freshCatalog) {
    const sku = extractSku(g.image || '');
    let price = g.priceRubValue ? Math.round(g.priceRubValue) : null;
    if (!price && g.price) {
      price = parseInt(g.price.replace(/[^\d]/g, ''), 10);
    }
    if (sku && price > 0) {
      priceBySku.set(sku, { price, title: g.title, source: 'fresh-catalog' });
    }
    if (g.url) {
      const urlSku = extractSkuFromUrl(g.url);
      if (urlSku && price > 0) {
        priceBySku.set(urlSku, { price, title: g.title, source: 'fresh-catalog-url' });
      }
    }
  }

  // Process old catalog
  for (const g of oldCatalog) {
    const sku = extractSku(g.image || '');
    let price = g.priceRubValue ? Math.round(g.priceRubValue) : null;
    if (!price && g.price) {
      price = parseInt(g.price.replace(/[^\d]/g, ''), 10);
    }
    if (sku && price > 0 && !priceBySku.has(sku)) {
      priceBySku.set(sku, { price, title: g.title, source: 'old-catalog' });
    }
  }

  // Process share sections - use share_price_ps5_with_value
  for (const g of [...novinki, ...predzakazy]) {
    const sku = extractSku(g.image || '');
    let price = null;
    if (g.share_price_ps5_with_value) {
      price = Math.round(g.share_price_ps5_with_value);
    } else if (g.priceRubValue) {
      price = Math.round(g.priceRubValue);
    }
    if (sku && price > 0 && !priceBySku.has(sku)) {
      priceBySku.set(sku, { price, title: g.title, source: 'share-section' });
    }
    // Also by URL
    if (g.url) {
      const urlSku = extractSkuFromUrl(g.url);
      if (urlSku && price > 0 && !priceBySku.has(urlSku)) {
        priceBySku.set(urlSku, { price, title: g.title, source: 'share-section-url' });
      }
    }
  }

  console.log(`Total unique SKUs with prices: ${priceBySku.size}`);

  // Get problematic products (< 1000₽)
  const cheapProducts = await prisma.product.findMany({
    where: { price: { lt: 1000 } },
    orderBy: { price: 'asc' }
  });

  console.log(`\nProducts with price < 1000₽: ${cheapProducts.length}`);

  let updatedCount = 0;

  for (const prod of cheapProducts) {
    const apiData = priceBySku.get(prod.id);
    if (apiData && apiData.price > prod.price) {
      console.log(`  FIX: "${prod.name}": ${prod.price} -> ${apiData.price} (${apiData.source})`);
      await prisma.product.update({
        where: { id: prod.id },
        data: { price: apiData.price }
      });
      updatedCount++;
    } else {
      console.log(`  STILL NOT FOUND: "${prod.name}" (${prod.id}) = ${prod.price}₽`);
    }
  }

  console.log(`\nFixed: ${updatedCount}`);

  // Check what's still broken
  const stillCheap = await prisma.product.findMany({
    where: { price: { lt: 500 } },
    orderBy: { price: 'asc' }
  });
  
  if (stillCheap.length > 0) {
    console.log(`\n=== STILL VERY CHEAP (< 500₽) ===`);
    for (const p of stillCheap) {
      console.log(`  ${p.price}₽ - ${p.name} [${p.id}]`);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

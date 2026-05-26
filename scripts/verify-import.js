const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const stepsPath = 'C:/Users/Пользователь/.gemini/antigravity/brain/bd36bb34-a9df-4c25-a2b8-b6d0dff2fb21/.system_generated/steps';

function readJSONFromMd(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const delimiter = '---';
  const index = content.indexOf(delimiter);
  const jsonStr = content.substring(index + delimiter.length).trim();
  return JSON.parse(jsonStr);
}

async function verify() {
  const catalog = [
    ...readJSONFromMd(path.join(stepsPath, '2116/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2136/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2137/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2138/content.md')),
    ...readJSONFromMd(path.join(stepsPath, '2139/content.md'))
  ];

  console.log('Fetching sample games from Database...');
  const dbProducts = await prisma.product.findMany({
    take: 10
  });

  console.log('\n--- VERIFYING ALIGNMENT ---');
  let matches = 0;
  for (const dbProd of dbProducts) {
    // Find matching game in original catalog
    const origGame = catalog.find(g => {
      const skuMatch = g.image.match(/product-([^/]+)/);
      const sku = skuMatch ? skuMatch[1] : null;
      return sku === dbProd.id;
    });

    if (origGame) {
      const origPrice = parseFloat(origGame.price.replace(/[^\d]/g, ''));
      const isPriceMatch = dbProd.price === origPrice;
      const isTitleMatch = dbProd.name === origGame.title;
      console.log(`DB Game: "${dbProd.name}" (${dbProd.id})`);
      console.log(`  DB Price: ${dbProd.price} | Orig Price: ${origPrice} -> ${isPriceMatch ? 'MATCH ✔' : 'MISMATCH ❌'}`);
      console.log(`  DB Image: ${dbProd.image} | Orig Image: ${origGame.image} -> MATCH ✔`);
      if (isPriceMatch && isTitleMatch) matches++;
    } else {
      console.log(`❌ DB Game "${dbProd.name}" (${dbProd.id}) not found in scraped JSON!`);
    }
  }

  console.log(`\nVerification complete. Matches verified: ${matches}/10`);
  await prisma.$disconnect();
}

verify().catch(e => {
  console.error(e);
  prisma.$disconnect();
});

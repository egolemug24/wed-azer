const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://deligame.ru/'
      },
      timeout: 30000
    };
    
    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Extract SKU from image path or URL
function extractSku(imageOrUrl) {
  // From image: /img/games/product-XXXXX/thumb.jpg
  const productMatch = imageOrUrl.match(/product-([^/]+)/);
  if (productMatch) return productMatch[1];
  
  // From image: /img/games/concept-XXXXX/thumb.jpg
  const conceptMatch = imageOrUrl.match(/concept-([^/]+)/);
  if (conceptMatch) return 'concept-' + conceptMatch[1];
  
  // From URL: .../product/EP0001-PPSA07497_00-AVATAR2COMPED000
  const urlMatch = imageOrUrl.match(/product\/([A-Z0-9]+-[A-Z0-9]+_[0-9]+-[A-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  
  return null;
}

// Parse price from string like "3 140 ₽" or "586 ₽"
function parsePrice(priceStr) {
  if (!priceStr) return null;
  // Remove all non-digit characters except spaces, then remove spaces
  const cleaned = priceStr.replace(/[^\d\s]/g, '').replace(/\s+/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

async function main() {
  console.log('Fetching fresh data from deligame.ru API...');
  
  const collections = [
    { id: 38, name: 'Catalog (main)' },
    { id: 17, name: 'Новинки' },
    { id: 23, name: 'Предзаказы' },
  ];
  
  // Build a map: SKU -> { price, title, source }
  const priceMap = new Map();
  
  for (const col of collections) {
    const url = `https://deligame.ru/api/collection/${col.id}/games?limit=1000&lite=true`;
    console.log(`\nFetching collection ${col.id} (${col.name})...`);
    
    try {
      const games = await fetchJSON(url);
      console.log(`  Got ${games.length} games`);
      
      for (const game of games) {
        const sku = extractSku(game.image);
        if (!sku) continue;
        
        // Determine the best price:
        // 1. Use priceRubValue if available (numeric)
        // 2. Parse from share_price_ps5_with (PS5 price with subscription - this is the catalog price)
        // 3. Parse from price field
        let price = null;
        
        if (col.id === 38) {
          // Main catalog - use price field directly
          if (game.priceRubValue) {
            price = Math.round(game.priceRubValue);
          } else {
            price = parsePrice(game.price);
          }
        } else {
          // Share sections (Новинки/Предзаказы) - use share_price_ps5_with (full price with subscription)
          // This is the more "standard" price customers see
          if (game.share_price_ps5_with_value) {
            price = Math.round(game.share_price_ps5_with_value);
          } else if (game.share_price_ps5_with) {
            price = parsePrice(game.share_price_ps5_with);
          } else if (game.priceRubValue) {
            price = Math.round(game.priceRubValue);
          } else {
            price = parsePrice(game.price);
          }
        }
        
        if (price && price > 0) {
          // Only overwrite if this is a higher-priority source or price not yet set
          if (!priceMap.has(sku) || col.id === 38) {
            priceMap.set(sku, { price, title: game.title, source: col.name });
          }
        }
      }
    } catch (err) {
      console.error(`  Error fetching collection ${col.id}: ${err.message}`);
    }
    
    await sleep(1000);
  }
  
  console.log(`\nTotal unique SKUs with prices: ${priceMap.size}`);
  
  // Now update all products in DB
  const products = await prisma.product.findMany();
  console.log(`Total products in DB: ${products.length}`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  let unchangedCount = 0;
  
  for (const prod of products) {
    const apiData = priceMap.get(prod.id);
    
    if (apiData) {
      if (prod.price !== apiData.price) {
        console.log(`  UPDATE: "${prod.name}" ${prod.price} -> ${apiData.price} (from ${apiData.source})`);
        await prisma.product.update({
          where: { id: prod.id },
          data: { price: apiData.price }
        });
        updatedCount++;
      } else {
        unchangedCount++;
      }
    } else {
      // Try matching by concept ID format
      const conceptMatch = prod.id.match(/^concept-(.+)$/);
      if (conceptMatch) {
        // Already checked above via extractSku
        notFoundCount++;
        console.log(`  NOT FOUND in API: "${prod.name}" (${prod.id}) - current price: ${prod.price}`);
      } else if (prod.id.startsWith('game-')) {
        notFoundCount++;
        console.log(`  SEED DATA: "${prod.name}" (${prod.id}) - current price: ${prod.price}`);
      } else {
        notFoundCount++;
        if (prod.price < 500) {
          console.log(`  NOT FOUND (LOW PRICE): "${prod.name}" (${prod.id}) - current price: ${prod.price}`);
        }
      }
    }
  }
  
  console.log('\n=== RESULTS ===');
  console.log(`Updated: ${updatedCount}`);
  console.log(`Unchanged: ${unchangedCount}`);
  console.log(`Not found in API: ${notFoundCount}`);
  
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

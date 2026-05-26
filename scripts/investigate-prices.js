const fs = require('fs');
const path = require('path');

const oldStepsPath = 'C:/Users/Пользователь/.gemini/antigravity/brain/bd36bb34-a9df-4c25-a2b8-b6d0dff2fb21/.system_generated/steps';

function readJSONFromMd(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const index = content.indexOf('---');
    if (index === -1) return [];
    return JSON.parse(content.substring(index + 3).trim());
  } catch (err) {
    console.error('Error:', err.message);
    return [];
  }
}

// Items we need to investigate
const targets = [
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

function extractSku(imageStr) {
  const m = imageStr.match(/product-([^/]+)/);
  if (m) return m[1];
  return null;
}

// Check all old step files
const allSteps = ['2116', '2118', '2119', '2136', '2137', '2138', '2139'];

for (const step of allSteps) {
  const filePath = path.join(oldStepsPath, step, 'content.md');
  if (!fs.existsSync(filePath)) continue;
  const games = readJSONFromMd(filePath);
  
  for (const g of games) {
    const sku = extractSku(g.image || '');
    if (!sku || !targets.includes(sku)) continue;
    
    console.log(`\n=== ${g.title} (step ${step}) ===`);
    console.log(`  SKU: ${sku}`);
    console.log(`  price: "${g.price}"`);
    console.log(`  priceRubValue: ${g.priceRubValue}`);
    if (g.share_price_ps5_with_value) {
      console.log(`  share_price_ps5_with_value: ${g.share_price_ps5_with_value} ("${g.share_price_ps5_with}")`);
    }
    if (g.share_price_ps5_without_value) {
      console.log(`  share_price_ps5_without_value: ${g.share_price_ps5_without_value} ("${g.share_price_ps5_without}")`);
    }
  }
}
console.log('\nDone');

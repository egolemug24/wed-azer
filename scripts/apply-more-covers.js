const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generatedImages = {
  gta_5: 'C:/Users/Пользователь/.gemini/antigravity/brain/c9588d65-f0b4-462b-b72d-34c816e9fe02/gta_5_cover_1779823295407.png',
  cyberpunk_2077: 'C:/Users/Пользователь/.gemini/antigravity/brain/c9588d65-f0b4-462b-b72d-34c816e9fe02/cyberpunk_2077_cover_1779823317013.png',
  rdr2: 'C:/Users/Пользователь/.gemini/antigravity/brain/c9588d65-f0b4-462b-b72d-34c816e9fe02/rdr2_cover_1779823334310.png',
  hogwarts_legacy: 'C:/Users/Пользователь/.gemini/antigravity/brain/c9588d65-f0b4-462b-b72d-34c816e9fe02/hogwarts_legacy_cover_1779823351425.png',
  mortal_kombat_1: 'C:/Users/Пользователь/.gemini/antigravity/brain/c9588d65-f0b4-462b-b72d-34c816e9fe02/mortal_kombat_1_cover_1779823369008.png',
  wukong: 'C:/Users/Пользователь/.gemini/antigravity/brain/c9588d65-f0b4-462b-b72d-34c816e9fe02/wukong_cover_1779823385166.png',
  stalker_2: 'C:/Users/Пользователь/.gemini/antigravity/brain/c9588d65-f0b4-462b-b72d-34c816e9fe02/stalker_2_cover_1779823403105.png',
  helldivers_2: 'C:/Users/Пользователь/.gemini/antigravity/brain/c9588d65-f0b4-462b-b72d-34c816e9fe02/helldivers_2_cover_1779823420928.png',
};

const destDir = path.join(__dirname, '../public/img/games');

const filesMap = {
  gta_5: 'gta_5_cover.png',
  cyberpunk_2077: 'cyberpunk_2077_cover.png',
  rdr2: 'rdr2_cover.png',
  hogwarts_legacy: 'hogwarts_legacy_cover.png',
  mortal_kombat_1: 'mortal_kombat_1_cover.png',
  wukong: 'wukong_cover.png',
  stalker_2: 'stalker_2_cover.png',
  helldivers_2: 'helldivers_2_cover.png',
};

// Search criteria maps game keys to substrings we want to search in product names
const searchCriteria = {
  gta_5: ['gta 5', 'gta v', 'grand theft auto'],
  cyberpunk_2077: ['cyberpunk 2077', 'киберпанк'],
  rdr2: ['red dead redemption 2', 'rdr 2', 'rdr2'],
  hogwarts_legacy: ['hogwarts', 'хогвартс'],
  mortal_kombat_1: ['mortal kombat 1', 'mortal kombat™ 1', 'mk 1', 'mk1'],
  wukong: ['wukong', 'вуконг'],
  stalker_2: ['stalker 2', 's.t.a.l.k.e.r. 2', 'stalker: 2'],
  helldivers_2: ['helldivers 2', 'helldivers™ 2'],
};

async function main() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  console.log('Copying new cover images to public directory...');
  for (const [key, srcPath] of Object.entries(generatedImages)) {
    const destPath = path.join(destDir, filesMap[key]);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  Copied: ${srcPath} -> ${filesMap[key]}`);
    } else {
      console.error(`  Source file not found: ${srcPath}`);
    }
  }

  console.log('\nQuerying database products and updating covers...');
  
  // Fetch all products
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products total in database.`);

  for (const [key, terms] of Object.entries(searchCriteria)) {
    const imageUrl = `/img/games/${filesMap[key]}`;
    let matchCount = 0;

    for (const p of products) {
      const lowerName = p.name.toLowerCase();
      // Check if product name contains any of the search terms
      const isMatch = terms.some(term => lowerName.includes(term.toLowerCase()));
      
      if (isMatch) {
        try {
          await prisma.product.update({
            where: { id: p.id },
            data: { image: imageUrl }
          });
          console.log(`  Updated: "${p.name}" [ID: ${p.id}] -> ${imageUrl}`);
          matchCount++;
        } catch (err) {
          console.error(`  Error updating "${p.name}":`, err.message);
        }
      }
    }
    console.log(`Completed ${key} updates: updated ${matchCount} products.`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

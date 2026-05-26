const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Paths to the generated images in the brain folder
const generatedImages = {
  elden_ring: 'C:/Users/Пользователь/.gemini/antigravity/brain/65d9cd3c-fa23-4930-b585-16622ce754f9/elden_ring_cover_1779820814417.png',
  spiderman_2: 'C:/Users/Пользователь/.gemini/antigravity/brain/65d9cd3c-fa23-4930-b585-16622ce754f9/spiderman_2_cover_1779820845403.png',
  god_of_war: 'C:/Users/Пользователь/.gemini/antigravity/brain/65d9cd3c-fa23-4930-b585-16622ce754f9/god_of_war_cover_1779820861642.png',
  fc_25: 'C:/Users/Пользователь/.gemini/antigravity/brain/65d9cd3c-fa23-4930-b585-16622ce754f9/fc_25_cover_1779820878582.png',
};

const destDir = path.join(__dirname, '../public/img/games');

async function main() {
  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy each image to its friendly name in public directory
  console.log('Copying generated covers to public directory...');
  
  const filesMap = {
    elden_ring: 'elden_ring_cover.png',
    spiderman_2: 'spiderman_2_cover.png',
    god_of_war: 'god_of_war_cover.png',
    fc_25: 'fc_25_cover.png',
  };

  for (const [key, srcPath] of Object.entries(generatedImages)) {
    const destPath = path.join(destDir, filesMap[key]);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  Copied: ${srcPath} -> ${filesMap[key]}`);
    } else {
      console.error(`  Source file not found: ${srcPath}`);
    }
  }

  // Update Database products
  console.log('\nUpdating database products with new cover paths...');

  const dbUpdates = [
    {
      // Marvel’s Человек-Паук 2
      id: 'EP9000-PPSA08338_00-MARVELSPIDERMAN2',
      image: '/img/games/spiderman_2_cover.png',
    },
    {
      // God of War Рагнарёк
      id: 'EP9000-PPSA08332_00-GOWRAGNAROK00000',
      image: '/img/games/god_of_war_cover.png',
    },
    {
      // ELDEN RING PS4 & PS5
      id: 'EP0700-PPSA04609_00-ELDENRING0000000',
      image: '/img/games/elden_ring_cover.png',
    },
    {
      // EA SPORTS FC 26 (game-153)
      id: 'game-153-1779728701847',
      image: '/img/games/fc_25_cover.png',
    },
    {
      // EA SPORTS FC 26 (concept-10011898)
      id: 'concept-10011898',
      image: '/img/games/fc_25_cover.png',
    }
  ];

  for (const update of dbUpdates) {
    try {
      const exists = await prisma.product.findUnique({ where: { id: update.id } });
      if (exists) {
        await prisma.product.update({
          where: { id: update.id },
          data: { image: update.image }
        });
        console.log(`  Updated database for product: "${exists.name}" [${update.id}]`);
      } else {
        console.log(`  Product not found in DB: ${update.id}`);
      }
    } catch (err) {
      console.error(`  Failed to update product ${update.id}:`, err.message);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

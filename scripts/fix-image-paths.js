const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update local paths for images now downloaded
  const updates = [
    {
      id: 'UP6312-PPSA23943_00-FLIGHTSIM2024STA',
      image: '/img/games/UP6312-PPSA23943_00-FLIGHTSIM2024STA.jpg'
    },
    {
      id: 'EB0236-PPSA28336_00-STALKER2UA000000',
      image: '/img/games/EB0236-PPSA28336_00-STALKER2UA000000.jpg'
    }
  ];

  for (const u of updates) {
    const prod = await prisma.product.findUnique({ where: { id: u.id } });
    if (prod) {
      await prisma.product.update({ where: { id: u.id }, data: { image: u.image } });
      console.log(`Updated image path for: ${prod.name}`);
    } else {
      console.log(`Product not found: ${u.id}`);
    }
  }

  // Check Forza Horizon 5 current state
  const forza = await prisma.product.findUnique({ where: { id: 'UP6312-PPSA22327_00-0629872585919347' } });
  if (forza) {
    console.log(`\nForza Horizon 5 current image: ${forza.image}`);
    // Use a reliable CDN alternative (PlayStation Store official image)
    const forzaImage = 'https://image.api.playstation.com/vulcan/ap/rnd/202106/1704/tz3DFBYj0eEZqhCMULkO3XoA.png';
    await prisma.product.update({
      where: { id: 'UP6312-PPSA22327_00-0629872585919347' },
      data: { image: forzaImage }
    });
    console.log(`Updated Forza Horizon 5 to PlayStation Store image`);
  }

  console.log('\nDone!');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

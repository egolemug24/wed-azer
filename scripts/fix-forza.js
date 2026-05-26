const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check all products with PPSA22327 in ID
  const products = await prisma.product.findMany({
    where: { id: { contains: 'PPSA22327' } }
  });
  
  console.log('Products with PPSA22327:');
  products.forEach(p => {
    console.log(`  ID: ${p.id}`);
    console.log(`  Name: ${p.name}`);
    console.log(`  Image: ${p.image}`);
    console.log('');
  });

  // Update the forza product to use the existing local image
  const forzaId = 'UP6312-PPSA22327_00-0629872585919347';
  const localImg = '/img/games/UP6312-PPSA22327_00-0547256477986893.jpg';
  
  const prod = await prisma.product.findUnique({ where: { id: forzaId } });
  if (prod) {
    await prisma.product.update({
      where: { id: forzaId },
      data: { image: localImg }
    });
    console.log(`Updated ${prod.name} to use local image: ${localImg}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

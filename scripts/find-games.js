const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const games = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'FC 25', mode: 'insensitive' } },
        { name: { contains: 'FC 26', mode: 'insensitive' } },
        { name: { contains: 'Spider-Man', mode: 'insensitive' } },
        { name: { contains: 'God of War', mode: 'insensitive' } },
        { name: { contains: 'Elden Ring', mode: 'insensitive' } },
      ]
    }
  });

  console.log(`Found ${games.length} products:`);
  games.forEach(g => {
    console.log(`- [${g.id}] "${g.name}"`);
    console.log(`  Price: ${g.price} ₽`);
    console.log(`  Image: ${g.image}`);
  });

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});

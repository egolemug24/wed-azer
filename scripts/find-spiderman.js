const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const games = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Паук', mode: 'insensitive' } },
        { name: { contains: 'Spider', mode: 'insensitive' } },
        { name: { contains: 'Человек', mode: 'insensitive' } },
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

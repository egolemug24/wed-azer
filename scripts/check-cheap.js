const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cheap = await prisma.product.findMany({
    where: { price: { lt: 1000 } },
    orderBy: { price: 'asc' }
  });

  console.log(`Товаров дешевле 1000 руб: ${cheap.length}`);
  cheap.forEach(p => {
    console.log(`  ${p.price} руб - ${p.name} [${p.id}]`);
  });

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

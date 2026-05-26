const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    orderBy: { price: 'asc' }
  });
  
  console.log('=== Самые дешевые товары (возможные ошибки) ===');
  const cheap = products.filter(p => p.price < 500);
  cheap.forEach(p => {
    console.log(`  ${p.price} руб - ${p.name} (id: ${p.id})`);
  });
  
  console.log('\n=== Самые дорогие товары ===');
  const expensive = products.slice(-10).reverse();
  expensive.forEach(p => {
    console.log(`  ${p.price} руб - ${p.name}`);
  });

  console.log('\n=== Все цены ===');
  products.forEach(p => {
    console.log(`  ${p.price} руб - ${p.name}`);
  });

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

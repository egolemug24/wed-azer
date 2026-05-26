const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log('DB OK, products:', count);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('DB error:', e.message);
  await prisma.$disconnect();
  process.exit(1);
});

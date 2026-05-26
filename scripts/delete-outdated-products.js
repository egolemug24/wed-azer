const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const problemIds = [
  'UP1001-PPSA01494_00-000000000000OAK2',    // Borderlands 4
  'EP4399-PPSA19644_00-FARMSIMULAT25PS5',     // Farming Simulator 25
  'EP4133-PPSA10695_00-ATOMICHEARTGLDED',     // Atomic Heart Standart
  'EP3969-PPSA11386_00-007FIRSTLIGHT000',     // 007 First Light
  'EP4133-PPSA10695_00-ATOMICHEARTPRMED',     // Atomic Heart Premium
  'EP1018-PPSA01865_00-LSWTSSBNDLEDELUX',    // LEGO SW
  'EP0102-PPSA07412_00-RE4RMAINGAME0000',    // RE4 Remake
  'EP0177-PPSA02384_00-LIKEADRAGON00000',    // Yakuza
  'EP0177-PPSA10873_00-APPLICATION00000',    // Persona 3
];

async function main() {
  console.log('Checking references for products to be deleted...');

  for (const id of problemIds) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        favoritedBy: true,
        orderItems: true,
      }
    });

    if (!product) {
      console.log(`Product ${id} not found in database.`);
      continue;
    }

    console.log(`Product: "${product.name}" [${id}]`);
    console.log(`  Favorites count: ${product.favoritedBy.length}`);
    console.log(`  Order items count: ${product.orderItems.length}`);

    // If orderItems exist, we might need to delete them first or remove the product references.
    if (product.orderItems.length > 0) {
      console.log(`  Deleting ${product.orderItems.length} order items...`);
      await prisma.orderItem.deleteMany({
        where: { productId: id }
      });
    }

    // Now delete the product
    await prisma.product.delete({
      where: { id }
    });
    console.log(`  Deleted product successfully.`);
  }

  console.log('All done!');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Error during deletion:', e);
  await prisma.$disconnect();
  process.exit(1);
});

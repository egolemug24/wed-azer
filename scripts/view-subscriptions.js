const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.subscriptionPlan.findMany();
  console.log(JSON.stringify(plans, null, 2));
  
  const settings = await prisma.settings.findMany();
  console.log('Settings:', JSON.stringify(settings, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);

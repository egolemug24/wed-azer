const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  const imgDir = path.join(__dirname, '../public/img/games');
  
  let localOk = 0;
  let remoteUrl = 0;
  let localMissing = 0;

  const problems = [];

  for (const p of products) {
    if (p.image.startsWith('/img/')) {
      const localPath = path.join(__dirname, '../public', p.image);
      if (fs.existsSync(localPath)) {
        const stats = fs.statSync(localPath);
        if (stats.size > 0) {
          localOk++;
        } else {
          localMissing++;
          problems.push({ name: p.name, id: p.id, image: p.image, issue: 'Empty file' });
        }
      } else {
        localMissing++;
        problems.push({ name: p.name, id: p.id, image: p.image, issue: 'File not found' });
      }
    } else {
      remoteUrl++;
      problems.push({ name: p.name, id: p.id, image: p.image, issue: 'Remote URL' });
    }
  }

  console.log(`Total products: ${products.length}`);
  console.log(`Local images OK: ${localOk}`);
  console.log(`Remote URLs: ${remoteUrl}`);
  console.log(`Local missing/empty: ${localMissing}`);
  
  if (problems.length > 0) {
    console.log('\nProblems:');
    problems.forEach(p => console.log(`  [${p.issue}] ${p.name} -> ${p.image}`));
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

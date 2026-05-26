const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const prisma = new PrismaClient();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadImage(url, destPath) {
  for (let i = 0; i < 5; i++) {
    try {
      const success = await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        const options = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': 'https://deligame.ru/',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          },
          timeout: 20000
        };
        const req = https.get(url, options, (response) => {
          console.log(`    Status: ${response.statusCode}`);
          if (response.statusCode !== 200) {
            reject(new Error(`Status ${response.statusCode}`));
            return;
          }
          response.pipe(file);
          file.on('finish', () => file.close(() => resolve(true)));
        });
        req.on('error', (err) => { fs.unlink(destPath, () => {}); reject(err); });
        req.on('timeout', () => { req.destroy(); fs.unlink(destPath, () => {}); reject(new Error('Timeout')); });
      });
      return true;
    } catch (err) {
      console.log(`    Attempt ${i + 1} failed: ${err.message}`);
      if (i < 4) await sleep(2000);
    }
  }
  return false;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { image: { startsWith: 'https://' } }
  });
  
  console.log(`Found ${products.length} products with remote URLs`);
  const imgDir = path.join(__dirname, '../public/img/games');

  for (const p of products) {
    console.log(`\nProcessing: ${p.name}`);
    console.log(`  Remote URL: ${p.image}`);
    
    // Extract a safe filename from the URL
    const urlPart = p.image.replace('https://deligame.ru/img/games/', '').replace('/thumb.jpg', '').replace(/[^a-zA-Z0-9_-]/g, '-');
    const localName = `${urlPart}.jpg`;
    const localPath = path.join(imgDir, localName);
    const dbPath = `/img/games/${localName}`;

    console.log(`  Downloading to: ${localName}`);
    const success = await downloadImage(p.image, localPath);
    
    if (success) {
      const stats = fs.statSync(localPath);
      console.log(`  Downloaded ${stats.size} bytes`);
      await prisma.product.update({ where: { id: p.id }, data: { image: dbPath } });
      console.log(`  Updated DB to local path: ${dbPath}`);
    } else {
      console.log(`  FAILED - keeping remote URL`);
    }
    await sleep(1000);
  }

  console.log('\nDone!');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

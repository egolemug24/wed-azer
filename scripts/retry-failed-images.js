const fs = require('fs');
const path = require('path');
const https = require('https');

const failedImages = [
  {
    name: 'Microsoft Flight Simulator 2024',
    sku: 'UP6312-PPSA23943_00-FLIGHTSIM2024STA',
    url: 'https://deligame.ru/img/games/product-UP6312-PPSA23943_00-FLIGHTSIM2024STA/thumb.jpg'
  },
  {
    name: 'STALKER 2: Heart of Chornobyl',
    sku: 'EB0236-PPSA28336_00-STALKER2UA000000',
    url: 'https://deligame.ru/img/games/product-EB0236-PPSA28336_00-STALKER2UA000000/thumb.jpg'
  },
  {
    name: 'Forza Horizon 5',
    sku: 'UP6312-PPSA22327_00-0629872585919347',
    url: 'https://deligame.ru/img/games/product-UP6312-PPSA22327_00-0629872585919347/thumb.jpg'
  }
];

const imgDir = path.join(__dirname, '../public/img/games');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://deligame.ru/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive'
      },
      timeout: 30000
    };
    const req = https.get(url, options, (response) => {
      console.log(`  Status: ${response.statusCode}`);
      if (response.statusCode !== 200) {
        reject(new Error(`Status code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
    });
    req.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      fs.unlink(destPath, () => {});
      reject(new Error('Timeout'));
    });
  });
}

async function main() {
  for (const item of failedImages) {
    const destPath = path.join(imgDir, `${item.sku}.jpg`);
    console.log(`\nTrying to download: ${item.name}`);
    console.log(`URL: ${item.url}`);
    
    let success = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.log(`  Attempt ${attempt}...`);
        await downloadImage(item.url, destPath);
        const stats = fs.statSync(destPath);
        console.log(`  SUCCESS! Downloaded ${stats.size} bytes`);
        success = true;
        break;
      } catch (err) {
        console.log(`  Failed: ${err.message}`);
        await sleep(3000);
      }
    }
    
    if (!success) {
      console.log(`  FAILED after 5 attempts for ${item.name}`);
    }
    await sleep(2000);
  }
  console.log('\nDone!');
}

main().catch(console.error);

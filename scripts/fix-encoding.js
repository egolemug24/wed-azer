const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/subscriptions/page.tsx');

try {
  const buffer = fs.readFileSync(filePath);
  console.log('File size:', buffer.length, 'bytes');

  // Let's check for invalid UTF-8 byte sequences
  // We can convert to string with 'utf8' which replaces invalid sequences with replacement characters,
  // or we can inspect where the error is.
  const str = buffer.toString('utf8');
  
  // Let's write the clean UTF-8 string back to the file
  fs.writeFileSync(filePath, str, 'utf8');
  console.log('Successfully re-saved file as clean UTF-8.');
} catch (err) {
  console.error('Error:', err);
}

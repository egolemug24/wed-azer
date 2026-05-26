const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/Пользователь/.gemini/antigravity/brain/65d9cd3c-fa23-4930-b585-16622ce754f9/walkthrough.md';

try {
  const buffer = fs.readFileSync(filePath);
  let str = buffer.toString('utf8');
  
  // Replace the corrupt text block with a clean version
  const badIndex = str.indexOf('');
  if (badIndex !== -1) {
    str = str.replace(//g, '');
  }

  // Let's also do a search and replace to clean up the trailing duplicates at the end
  const cleanEnd = str.split('---')[0] + '---' + str.split('---')[1] + '---' + str.split('---')[2];
  
  fs.writeFileSync(filePath, str, 'utf8');
  console.log('Successfully cleaned walkthrough.md and saved as UTF-8.');
} catch (err) {
  console.error('Error:', err);
}

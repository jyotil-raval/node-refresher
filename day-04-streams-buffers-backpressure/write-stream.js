const fs = require('fs');

const writeStream = fs.createWriteStream('./output.txt');

for (let i = 1; i <= 5; i++) {
  const ok = writeStream.write(`Line ${i}\n`);
  console.log(`Write ${i}: ${ok ? 'accepted' : 'buffer full'}`);
}

writeStream.end('Stream writing complete.\n');
writeStream.on('finish', () => console.log('All writes finished.'));

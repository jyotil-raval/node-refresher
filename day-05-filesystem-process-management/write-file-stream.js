const fs = require('fs');

const stream = fs.createWriteStream('./output.txt');

for (let i = 0; i < 1e5; i++) {
  const ok = stream.write(`Line ${i}\n`);
  if (!ok) {
    console.log('Buffer full — pausing writes');
    stream.once('drain', () => console.log('Resuming...'));
  }
}

stream.end('Stream complete.\n');
stream.on('finish', () => console.log('Write finished.'));

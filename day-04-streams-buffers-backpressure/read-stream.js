const fs = require('fs');

const readStream = fs.createReadStream('./input.txt', { encoding: 'utf-8' });

console.log('Starting to read stream...');

readStream.on('data', (chunk) => {
  console.log('Received chunk:', chunk);
});

readStream.on('end', () => {
  console.log('Finished reading stream.');
});

readStream.on('error', (err) => {
  console.error('Stream error:', err);
});

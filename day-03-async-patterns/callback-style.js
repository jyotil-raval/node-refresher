const fs = require('fs');

console.log('Start reading...');

fs.readFile('./sample.txt', 'utf-8', (err, data) => {
  if (err) return console.error('Error:', err);
  console.log('File content:', data.trim());
});

console.log('After readFile call');

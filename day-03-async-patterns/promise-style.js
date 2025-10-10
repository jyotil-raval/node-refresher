const fs = require('fs').promises;

console.log('Start reading (promise)...');

fs.readFile('./sample.txt', 'utf-8')
  .then((data) => console.log('File content:', data.trim()))
  .catch((err) => console.error('Error:', err));

console.log('After readFile call (promise)');

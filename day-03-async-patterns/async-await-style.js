const fs = require('fs').promises;

async function readFileAsync() {
  console.log('Start reading (async/await)...');
  try {
    const data = await fs.readFile('./sample.txt', 'utf-8');
    console.log('File content:', data.trim());
  } catch (err) {
    console.error('Error:', err);
  }
  console.log('Done reading file.');
}

readFileAsync();
console.log('After calling readFileAsync');

setTimeout(() => console.log('Timeout callback'), 0);
Promise.resolve().then(() => console.log('Promise microtask'));

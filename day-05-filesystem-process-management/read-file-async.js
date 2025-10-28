const fs = require('fs').promises;

(async () => {
  console.log('Start reading...');
  const data = await fs.readFile('./input.txt', 'utf-8');
  console.log('Content:', data);
  console.log('Done ✅');
})();

const { fork } = require('child_process');
const path = require('path');

// Use absolute path so Node resolves correctly
const workerPath = path.join(__dirname, 'worker.js');
const worker = fork(workerPath);

worker.send({ numbers: [1, 2, 3, 4, 5] });

worker.on('message', (msg) => {
  console.log('Master received result:', msg);
});

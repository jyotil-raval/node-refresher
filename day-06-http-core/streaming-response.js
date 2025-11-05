const http = require('http');

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      res.write(`Chunk ${counter}\n`);
      if (counter === 5) {
        clearInterval(interval);
        res.end('Stream complete.\n');
      }
    }, 1000);
  })
  .listen(3001, () => console.log('🌀 Streaming server on http://localhost:3001'));

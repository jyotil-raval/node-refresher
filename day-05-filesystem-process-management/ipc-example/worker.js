process.on('message', (msg) => {
  const result = msg.numbers.reduce((a, b) => a + b, 0);
  process.send({ sum: result });
});

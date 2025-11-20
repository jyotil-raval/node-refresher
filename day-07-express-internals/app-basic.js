const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Day 07 — Express Internals!');
});

app.get('/about', (req, res) => {
  res.send('About this server: built on top of Node’s HTTP core.');
});

app.listen(3000, () => console.log('🚀 Express running on http://localhost:3000'));

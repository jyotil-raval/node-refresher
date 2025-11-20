const createApp = require('./mini-express');
const app = createApp();

app.use((req, res, next) => {
  console.log('🌐 Middleware fired:', req.method, req.url);
  next();
});

app.get('/', (req, res) => {
  res.end('Hello from mini-Express!');
});

app.get('/about', (req, res) => {
  res.end('Mini-Express About Page');
});

app.listen(3002, () => console.log('🧩 Mini Express running at http://localhost:3002'));

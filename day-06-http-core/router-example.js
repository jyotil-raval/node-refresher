const http = require('http');

const routes = {
  '/': 'Home Page',
  '/about': 'About Page',
  '/contact': 'Contact Us'
};

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(routes[req.url] || '404 - Not Found');
});

server.listen(3002, () => console.log('🧭 Router server at http://localhost:3002'));

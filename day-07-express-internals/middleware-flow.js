const express = require('express');
const app = express();

// 1. Global middleware
app.use((req, res, next) => {
  console.log('🧭 [Logger] Request:', req.method, req.url);
  next(); // Continue pipeline
});

// 2. Route-specific middleware
app.get(
  '/data',
  (req, res, next) => {
    console.log('🧩 [Middleware] Before data handler');
    next();
  },
  (req, res) => {
    console.log('📦 [Handler] Sending response');
    res.send({ msg: 'Pipeline complete' });
  }
);

app.listen(3001, () => console.log('⚙️ Server running on http://localhost:3001'));

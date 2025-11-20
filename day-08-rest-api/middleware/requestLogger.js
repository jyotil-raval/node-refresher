const { v4: uuid } = require('uuid');
module.exports = (req, res, next) => {
  const rid = uuid();
  req.requestId = rid;
  const start = Date.now();
  res.on('finish', () => {
    const diff = Date.now() - start;
    console.log(`[${rid}] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${diff}ms`);
  });
  next();
};

const http = require('http');

function createApp() {
  const stack = [];

  const app = (req, res) => {
    let idx = 0;

    function next(err) {
      const layer = stack[idx++];
      if (!layer) return res.end('404 Not Found');
      if (err) return res.end(`Error: ${err}`);
      layer(req, res, next);
    }

    next(); // start the chain
  };

  app.use = (fn) => stack.push(fn);

  app.get = (path, handler) => {
    stack.push((req, res, next) => {
      if (req.method === 'GET' && req.url === path) return handler(req, res);
      next();
    });
  };

  app.listen = (port, cb) => http.createServer(app).listen(port, cb);

  return app;
}

module.exports = createApp;

const express = require('express');
const usersRouter = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.use('/users', usersRouter);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;

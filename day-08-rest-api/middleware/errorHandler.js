const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

module.exports = (err, req, res, next) => {
  // If headers already sent, delegate to default handler
  if (res.headersSent) return next(err);

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof ConflictError) {
    return res.status(409).json({ error: err.message });
  }

  // Unknown error — log and send 500 with generic message
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
};

const store = require('../store/memoryStore');
module.exports = async (req, res, next) => {
  const key = req.header('Idempotency-Key');
  req.idempotencyKey = key;
  if (!key) return next();

  const cached = await store.getIdempotency(key);
  if (cached) {
    // short-circuit: return stored response
    return res.status(200).json({ data: cached });
  }
  // otherwise continue; service will save mapping after creation
  next();
};

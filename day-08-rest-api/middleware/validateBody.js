// simple schema validator: schema = { required: ['name','email'] }
module.exports = (schema) => (req, res, next) => {
  const body = req.body || {};
  const miss = (schema.required || []).filter((k) => body[k] === undefined);
  if (miss.length) return next(new (require('../utils/errors').ValidationError)(`Missing: ${miss.join(',')}`));
  next();
};

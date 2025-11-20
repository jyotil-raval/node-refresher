const usersService = require('../services/usersService');

exports.listUsers = async (req, res, next) => {
  try {
    const items = await usersService.list();
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await usersService.get(id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const payload = req.body;
    // idempotency middleware may have short-circuited returning stored response
    const created = await usersService.create(payload, req.idempotencyKey);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
};

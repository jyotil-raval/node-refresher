const store = require('../store/memoryStore');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

async function list() {
  return store.list();
}

async function get(id) {
  const item = await store.get(id);
  if (!item) throw new NotFoundError('User not found');
  return item;
}

async function create(payload, idempotencyKey) {
  // Very small business rules example
  if (!payload.name) throw new ValidationError('name required');
  // If idempotency handled earlier, still safe to check
  if (await store.findByEmail(payload.email)) {
    throw new ConflictError('Email already used');
  }
  const created = await store.create(payload);
  // Optionally persist idempotency response mapping in store
  if (idempotencyKey) await store.saveIdempotency(idempotencyKey, created);
  return created;
}

module.exports = { list, get, create };

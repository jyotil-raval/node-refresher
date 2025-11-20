const { v4: uuid } = require('uuid'); // npm i uuid
const users = new Map();
const idempotency = new Map();

async function list() {
  return Array.from(users.values());
}
async function get(id) {
  return users.get(id) || null;
}
async function findByEmail(email) {
  for (const u of users.values()) if (u.email === email) return u;
  return null;
}
async function create(payload) {
  const id = uuid();
  const item = { id, name: payload.name, email: payload.email, createdAt: new Date().toISOString() };
  users.set(id, item);
  return item;
}
async function saveIdempotency(key, response) {
  idempotency.set(key, response);
}
async function getIdempotency(key) {
  return idempotency.get(key);
}

module.exports = { list, get, findByEmail, create, saveIdempotency, getIdempotency };

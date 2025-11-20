class BaseError extends Error {}
class ValidationError extends BaseError {}
class NotFoundError extends BaseError {}
class ConflictError extends BaseError {}
module.exports = { ValidationError, NotFoundError, ConflictError };

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const validateBody = require('../middleware/validateBody');
const idempotency = require('../middleware/idempotency');
const userSchema = require('../schemas/userSchema');

router.get('/', usersController.listUsers);
router.get('/:id', usersController.getUser);
router.post('/', validateBody(userSchema), idempotency, usersController.createUser); // idempotent POST
module.exports = router;

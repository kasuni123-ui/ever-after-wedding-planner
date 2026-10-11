const { body, param } = require('express-validator');
module.exports = {
  email: body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  mongoId: name => param(name).isMongoId().withMessage('Invalid record identifier.')
};

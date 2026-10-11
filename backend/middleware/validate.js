const { validationResult } = require('express-validator');
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Please check the highlighted details.', fields: errors.array().map(({ path, msg }) => ({ field: path, message: msg })) });
  next();
}
module.exports = validate;

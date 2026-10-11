const crypto = require('node:crypto');
function createToken() { return crypto.randomBytes(32).toString('hex'); }
function csrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const expected = req.session?.csrfToken;
  const supplied = req.get('X-CSRF-Token');
  if (!expected || !supplied || expected.length !== supplied.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
    return res.status(403).json({ error: 'Security token expired. Refresh the page and try again.' });
  }
  next();
}
module.exports = { csrf, createToken };

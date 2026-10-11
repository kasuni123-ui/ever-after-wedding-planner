function notFound(req, res) {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'That API endpoint was not found.' });
  res.status(404).sendFile(require('node:path').join(__dirname, '../../public/404.html'));
}
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || (err.name === 'ValidationError' ? 400 : err.code === 11000 ? 409 : 500);
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({ error: status === 500 ? 'Something went wrong. Please try again.' : (err.message || 'Request could not be completed.') });
}
module.exports = { notFound, errorHandler };

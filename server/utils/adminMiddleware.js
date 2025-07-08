module.exports = function isAdmin(req, res, next) {
  // Assumes req.user is set by authentication middleware
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Admins only' });
}; 
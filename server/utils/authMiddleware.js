// authMiddleware.js
// Middleware to authenticate requests using JWT

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

module.exports = async function authMiddleware(req, res, next) {
  // Get the Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Find the user by ID from the token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    // Attach user to the request object
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}; 
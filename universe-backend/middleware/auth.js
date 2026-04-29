const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
require('../models/models');
const User = mongoose.model('User');

const JWT_SECRET = 'universe_super_secret_key_2026'; // ← hardcode

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token nahi hai' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET); // ← hardcode use karo
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User nahi mila' });
    }
    next();
  } catch(err) {
    console.log('JWT Error:', err.message);
    return res.status(401).json({ success: false, message: 'Token invalid: ' + err.message });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access nahi hai' });
  }
  next();
};

module.exports = { protect, authorize };
const router   = require('express').Router();
const mongoose = require('mongoose');
require('../models/models');
const User = mongoose.model('User');

// Chat ke liye users list lo
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });

    const jwt     = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const me      = await User.findById(decoded.id);

    // Apne alawa sab users lo
    let query = { _id: { $ne: decoded.id }, isApproved: true };

    // Student hain toh sirf faculty dikhao
    if (me.role === 'student') query.role = 'faculty';
    // Faculty hain toh students + faculty dikhao
    if (me.role === 'faculty') query.role = { $in: ['student','faculty'] };
    // Admin sab dekh sakta hai
    if (me.role === 'admin') query = { _id: { $ne: decoded.id } };

    const users = await User.find(query).select('name email role department');
    res.json({ success: true, users });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Courses list lo group chat ke liye
router.get('/groups', async (req, res) => {
  try {
    require('../models/models');
    const Course = mongoose.model('Course');
    const courses = await Course.find({ isActive: true }).select('name code');
    res.json({ success: true, courses });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const { User } = require('../models/models');

const JWT_SECRET = 'universe_super_secret_key_2026';
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, department } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered hai' });
    const user = await User.create({ name, email, phone, password, role, department, isApproved: role === 'admin' });
    res.status(201).json({ success: true, message: 'Registration ho gayi!', token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Email ya password galat hai' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Email ya password galat hai' });
    if (!user.isApproved) return res.status(403).json({ success: false, message: 'Admin ne approve nahi kiya' });
    res.json({ success: true, token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token nahi hai' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json({ success: true, user });
  } catch (err) { res.status(401).json({ success: false, message: 'Token invalid hai' }); }
});

module.exports = router;
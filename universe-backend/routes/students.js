const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const { User } = require('../models/models');

const JWT_SECRET = 'universe_super_secret_key_2026';

router.get('/', async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isApproved: true }).select('-password').sort({ name: 1 });
    res.json({ success: true, students });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student nahi mila' });
    res.json({ success: true, student });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student delete ho gaya' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
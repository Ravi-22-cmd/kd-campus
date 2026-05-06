const router   = require('express').Router();
const mongoose = require('mongoose');
require('../models/models');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');

// Update profile
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, department, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Basic info update
    if (name)       user.name       = name;
    if (phone)      user.phone      = phone;
    if (department) user.department = department;

    // Password change
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      user.password = newPassword;
    }

    await user.save();
    res.json({ success: true, message: 'Profile update ho gaya!', user: { id: user._id, name: user.name, email: user.email, phone: user.phone, department: user.department, role: user.role } });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
});

// Profile lo
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
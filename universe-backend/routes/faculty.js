const express  = require('express');
const router   = express.Router();
const { User } = require('../models/models');

router.get('/', async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty', isApproved: true }).select('-password').sort({ name: 1 });
    res.json({ success: true, faculty });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/pending', async (req, res) => {
  try {
    const pending = await User.find({ isApproved: false }).select('-password');
    res.json({ success: true, pending });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true }).select('-password');
    res.json({ success: true, message: req.body.isApproved ? 'Approve kar diya!' : 'Reject kar diya', user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
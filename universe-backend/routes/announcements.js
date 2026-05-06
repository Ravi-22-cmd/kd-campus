const router   = require('express').Router();
const mongoose = require('mongoose');
require('../models/models');
const Notice = mongoose.model('Notice');
const User   = mongoose.model('User');

// Create announcement
router.post('/', async (req, res) => {
  try {
    const notice = await Notice.create({
      title:      req.body.title,
      content:    req.body.content,
      type:       req.body.type || 'general',
      postedBy:   req.body.postedBy,
      targetRole: req.body.targetRole || 'all',
      isActive:   true
    });
    res.status(201).json({ success: true, notice });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
});

// Sab announcements lo
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true })
      .populate('postedBy', 'name role')
      .sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, notices });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await Notice.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Deleted' });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
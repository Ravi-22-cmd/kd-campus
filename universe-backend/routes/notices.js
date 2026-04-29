const express     = require('express');
const router      = express.Router();
const { Notice }  = require('../models/models');

router.post('/', async (req, res) => {
  try {
    const notice = await Notice.create(req.body);
    res.status(201).json({ success: true, notice });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, notices });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
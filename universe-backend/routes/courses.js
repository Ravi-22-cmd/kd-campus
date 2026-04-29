const express    = require('express');
const router     = express.Router();
const { Course } = require('../models/models');

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, courses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, course });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Course delete ho gaya' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
const router   = require('express').Router();
const mongoose = require('mongoose');
require('../models/models');
const Marks = mongoose.model('Marks');

// Marks save/update karo
router.post('/', async (req, res) => {
  try {
    const { studentId, courseId, examType, marks, maxMarks, semester } = req.body;

    // Already exist karta hai toh update karo
    const existing = await Marks.findOne({ studentId, courseId, examType });
    if (existing) {
      existing.marks    = marks;
      existing.maxMarks = maxMarks;
      await existing.save();
      return res.json({ success: true, message: 'Marks update ho gaye', marks: existing });
    }

    // Naya banao
    const newMarks = await Marks.create({ studentId, courseId, examType, marks, maxMarks, semester });
    res.status(201).json({ success: true, marks: newMarks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Student ke marks lo
router.get('/student/:studentId', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId })
      .populate('courseId', 'name code');
    res.json({ success: true, marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Course ke sab students ke marks lo
router.get('/course/:courseId', async (req, res) => {
  try {
    const marks = await Marks.find({ courseId: req.params.courseId })
      .populate('studentId', 'name email');
    res.json({ success: true, marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
const express   = require('express');
const router    = express.Router();
const { Marks } = require('../models/models');

router.post('/', async (req, res) => {
  try {
    const { studentId, courseId, examType, marks, maxMarks, semester } = req.body;
    const existing = await Marks.findOne({ studentId, courseId, examType });
    if (existing) {
      existing.marks = marks;
      await existing.save();
      return res.json({ success: true, marks: existing });
    }
    const newMarks = await Marks.create({ studentId, courseId, examType, marks, maxMarks, semester });
    res.status(201).json({ success: true, marks: newMarks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId }).populate('courseId', 'name code');
    res.json({ success: true, marks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
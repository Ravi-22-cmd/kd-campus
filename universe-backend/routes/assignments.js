const express        = require('express');
const router         = express.Router();
const { Assignment } = require('../models/models');

router.post('/', async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json({ success: true, assignment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find(req.query.courseId ? { courseId: req.query.courseId } : {}).populate('courseId', 'name code').sort({ dueDate: 1 });
    res.json({ success: true, assignments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
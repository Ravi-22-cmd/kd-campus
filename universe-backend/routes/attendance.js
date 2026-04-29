const router     = require('express').Router();
const mongoose   = require('mongoose');
require('../models/models');
const Attendance = mongoose.model('Attendance');
const { protect } = require('../middleware/auth');

// Attendance mark karo
router.post('/', protect, async (req, res) => {
  try {
    const { courseId, date, records, facultyId } = req.body;
    const attendance = await Attendance.create({
      courseId,
      facultyId: facultyId || req.user._id,
      date: new Date(date),
      records
    });
    res.status(201).json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Student ki attendance lo
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const records = await Attendance.find({
      'records.studentId': new mongoose.Types.ObjectId(studentId)
    }).populate('courseId', 'name code');

    const summary = {};

    records.forEach(att => {
      const courseName = att.courseId?.name || 'Unknown';
      if (!summary[courseName]) {
        summary[courseName] = { present: 0, total: 0 };
      }
      const record = att.records.find(
        r => r.studentId.toString() === studentId.toString()
      );
      if (record) {
        summary[courseName].total++;
        if (record.status === 'present' || record.status === 'late') {
          summary[courseName].present++;
        }
      }
    });

    const result = Object.entries(summary).map(([subject, data]) => ({
      subject,
      present: data.present,
      total:   data.total,
      pct:     data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }));

    res.json({ success: true, attendance: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
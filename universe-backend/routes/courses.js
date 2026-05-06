const express    = require('express');
const router     = express.Router();
const { Course } = require('../models/models');

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, courses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('students', 'name email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
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

// Enroll/Unenroll endpoints
router.post('/:courseId/enroll', async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?._id;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Only students can enroll
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can enroll' });
    }

    course.students = course.students || [];
    const objId = studentId; // already an ObjectId
    if (!course.students.some(id => id.toString() === objId.toString())) {
      course.students.push(objId);
      await course.save();
    }

    const updated = await Course.findById(courseId).populate('students', 'name email');
    return res.json({ success: true, course: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:courseId/unenroll', async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?._id;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can unenroll' });
    }

    course.students = (course.students || []).filter(id => id.toString() !== studentId.toString());
    await course.save();

    const updated = await Course.findById(courseId).populate('students', 'name email');
    return res.json({ success: true, course: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

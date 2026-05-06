const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const { User, Course } = require('../models/models');

const JWT_SECRET = 'universe_super_secret_key_2026';

router.get('/faces', async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = { role: 'student', isApproved: true };

    if (courseId) {
      const course = await Course.findById(courseId).select('students');
      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
      if (Array.isArray(course.students) && course.students.length) {
        filter._id = { $in: course.students };
      }
    }

    const students = await User.find(filter).select('name email department faceDescriptors');
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/face-descriptor', async (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ success: false, message: 'Invalid descriptor' });
    }

    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    student.faceDescriptors = student.faceDescriptors || [];
    student.faceDescriptors.push(descriptor);
    await student.save();

    res.json({ success: true, message: 'Face descriptor saved', faceDescriptors: student.faceDescriptors.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isApproved: true }).select('-password').sort({ name: 1 });
    res.json({ success: true, students });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, student });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student delete ho gaya' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
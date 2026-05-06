const router     = require('express').Router();
const mongoose   = require('mongoose');
require('../models/models');
const Attendance = mongoose.model('Attendance');
const User       = mongoose.model('User');

// Mark attendance (auth temporarily removed)
router.post('/', async (req, res) => {
  try {
    const { courseId, date, records, facultyId } = req.body;
    
    if (!courseId) return res.status(400).json({ success: false, message: 'CourseId required' });
    if (!facultyId) return res.status(400).json({ success: false, message: 'FacultyId required' });
    if (!records || !records.length) return res.status(400).json({ success: false, message: 'Records required' });

    const attendance = await Attendance.create({
      courseId,
      facultyId,
      date: new Date(date),
      records
    });
    res.status(201).json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Face attendance verification
router.post('/face-verify', async (req, res) => {
  try {
    const { courseId, faceDescriptor } = req.body;
    
    if (!courseId) return res.status(400).json({ success: false, message: 'CourseId required' });
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) return res.status(400).json({ success: false, message: 'Face descriptor required' });

    // Get all students in the course
    const course = await mongoose.model('Course').findById(courseId).populate('students');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let matchedStudent = null;
    let bestMatch = 0.6; // Threshold for face matching

    for (const student of course.students) {
      if (student.faceDescriptors && student.faceDescriptors.length > 0) {
        for (const storedDescriptor of student.faceDescriptors) {
          // Calculate Euclidean distance
          const distance = Math.sqrt(
            faceDescriptor.reduce((sum, val, i) => sum + Math.pow(val - storedDescriptor[i], 2), 0)
          );
          
          // Convert distance to similarity (lower distance = higher similarity)
          const similarity = Math.max(0, 1 - distance / 100); // Normalize

          if (similarity > bestMatch) {
            bestMatch = similarity;
            matchedStudent = student;
          }
        }
      }
    }

    if (matchedStudent && bestMatch > 0.7) { // Higher threshold for acceptance
      res.json({ 
        success: true, 
        student: { 
          id: matchedStudent._id, 
          name: matchedStudent.name, 
          email: matchedStudent.email 
        },
        confidence: bestMatch 
      });
    } else {
      res.json({ success: false, message: 'Face not recognized' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Register face descriptor for student
router.post('/register-face', async (req, res) => {
  try {
    const { studentId, faceDescriptors } = req.body;
    
    if (!studentId) return res.status(400).json({ success: false, message: 'StudentId required' });
    if (!faceDescriptors || !Array.isArray(faceDescriptors)) return res.status(400).json({ success: false, message: 'Face descriptors required' });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    student.faceDescriptors = faceDescriptors;
    await student.save();

    res.json({ success: true, message: 'Face registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark attendance (auth temporarily removed)
router.post('/', async (req, res) => {
  try {
    const { courseId, date, records, facultyId } = req.body;
    
    if (!courseId) return res.status(400).json({ success: false, message: 'CourseId required' });
    if (!facultyId) return res.status(400).json({ success: false, message: 'FacultyId required' });
    if (!records || !records.length) return res.status(400).json({ success: false, message: 'Records required' });

    const attendance = await Attendance.create({
      courseId,
      facultyId,
      date: new Date(date),
      records
    });
    res.status(201).json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Student ki attendance lo
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const records   = await Attendance.find({
      'records.studentId': new mongoose.Types.ObjectId(studentId)
    }).populate('courseId', 'name code');

    const summary = {};
    records.forEach(att => {
      const courseName = att.courseId?.name || 'Unknown';
      if (!summary[courseName]) summary[courseName] = { present: 0, total: 0 };
      const record = att.records.find(r => r.studentId.toString() === studentId.toString());
      if (record) {
        summary[courseName].total++;
        if (record.status === 'present' || record.status === 'late') summary[courseName].present++;
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

// Get attendance by course and date
router.get('/', async (req, res) => {
  try {
    const { courseId, date } = req.query;
    const query = {};
    if (courseId) query.courseId = courseId;
    if (date) query.date = new Date(date);
    
    const attendance = await Attendance.find(query).populate('courseId', 'name code');
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/models');

const Exam = mongoose.model('Exam');
const ExamResult = mongoose.model('ExamResult');
const Marks = mongoose.model('Marks');

router.get('/', async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true }).sort({ date: 1 }).select('title course date duration totalMarks description type');
    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { examId, answers, timeTaken } = req.body;
    if (!examId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Exam ID and answers are required' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const totalQuestions = exam.questions.length;
    const correctAnswers = exam.questions.reduce((sum, question, index) => {
      return sum + (answers[index] === question.answer ? 1 : 0);
    }, 0);

    const score = Math.round((correctAnswers / totalQuestions) * exam.totalMarks);

    const result = await ExamResult.create({
      examId,
      studentId: req.user._id,
      score,
      correctAnswers,
      totalQuestions,
      answers,
      submittedAt: new Date()
    });

    if (exam.type === 'scheduled' && exam.courseId) {
      const existingMarks = await Marks.findOne({
        studentId: req.user._id,
        courseId: exam.courseId,
        examType: 'external'
      });
      if (existingMarks) {
        existingMarks.marks = score;
        existingMarks.maxMarks = exam.totalMarks;
        await existingMarks.save();
      } else {
        await Marks.create({
          studentId: req.user._id,
          courseId: exam.courseId,
          examType: 'external',
          marks: score,
          maxMarks: exam.totalMarks
        });
      }
    }

    res.json({ success: true, result, score, correctAnswers, totalQuestions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/results', async (req, res) => {
  try {
    const results = await ExamResult.find({ studentId: req.user._id })
      .populate('examId', 'title course date type');
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

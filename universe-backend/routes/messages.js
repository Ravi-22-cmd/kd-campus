const router   = require('express').Router();
const mongoose = require('mongoose');

// Message Schema
const messageSchema = new mongoose.Schema({
  senderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  message:    { type: String, required: true },
  type:       { type: String, enum: ['private','group'], default: 'private' },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// Private messages lo
router.get('/private/:userId/:otherId', async (req, res) => {
  try {
    const msgs = await Message.find({
      type: 'private',
      $or: [
        { senderId: req.params.userId,  receiverId: req.params.otherId },
        { senderId: req.params.otherId, receiverId: req.params.userId  },
      ]
    }).sort({ createdAt: 1 }).limit(50);
    res.json({ success: true, messages: msgs });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
});

// Save message
router.post('/', async (req, res) => {
  try {
    const msg = await Message.create(req.body);
    res.status(201).json({ success: true, message: msg });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
});

// Group messages lo
router.get('/group/:courseId', async (req, res) => {
  try {
    const msgs = await Message.find({ courseId: req.params.courseId, type: 'group' })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 }).limit(100);
    res.json({ success: true, messages: msgs });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
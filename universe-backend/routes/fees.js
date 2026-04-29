const express  = require('express');
const router   = express.Router();
const { Fee }  = require('../models/models');

router.post('/', async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json({ success: true, fee });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const fees    = await Fee.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    const paid    = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
    const pending = fees.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);
    res.json({ success: true, fees, summary: { paid, pending } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/pay', async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, { status: 'paid', transactionId: req.body.transactionId, paidAt: new Date() }, { new: true });
    res.json({ success: true, fee });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
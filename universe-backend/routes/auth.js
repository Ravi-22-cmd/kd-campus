const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const { User } = require('../models/models');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fail fast so tokens never get generated with unknown secret.
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@kdcampus.edu';

async function sendResetEmail(email, token) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log(`Password reset token for ${email}: ${token}`);
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  const html = `
    <p>Hi,</p>
    <p>A password reset request was received for your KD Campus account.</p>
    <p>Use the code below to reset your password:</p>
    <p style="font-size:18px;font-weight:bold;padding:12px 16px;background:#f4f6ff;border-radius:10px;display:inline-block">${token}</p>
    <p>Or click the link below:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you did not request this, please ignore this message.</p>
    <p>Thanks,<br/>KD Campus Team</p>`;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: 'KD Campus Password Reset',
    html
  });
  return true;
}

router.post('/register', [
  body('name').trim().escape().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').trim().escape().isMobilePhone().withMessage('Valid phone number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
  body('department').optional().trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
  }

  try {
    const { name, email, phone, password, role, department } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, phone, password, role, department, isApproved: role === 'admin' });
    res.status(201).json({ success: true, message: 'Registration ho gayi!', token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').trim().escape().notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Email or password is incorrect' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Email or password is incorrect' });

    if (!user.isApproved) return res.status(403).json({ success: false, message: 'Not approved by admin' });

    // OTP compulsory login: password is verified, now user must verify OTP to receive JWT.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    user.otpCodeHash = otpHash;
    user.otpCodeExpiry = new Date(Date.now() + 1000 * 60 * 10); // 10 min
    await user.save();

    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@kdcampus.edu';

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      console.log(`OTP for ${email}: ${otp}`);
      return res.json({
        success: true,
        otpRequired: true,
        message: 'OTP sent (check server logs).',
      });
    }

    const transporter = nodemailer.createTransport({

      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    const html = `
      <p>Hi,</p>
      <p>Your KD Campus login OTP is:</p>
      <p style="font-size:20px;font-weight:bold;padding:12px 16px;background:#f4f6ff;border-radius:10px;display:inline-block">${otp}</p>
      <p>It is valid for 10 minutes.</p>
      <p>If you did not request this, ignore this email.</p>
      <p>Thanks,<br/>KD Campus Team</p>`;

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'KD Campus Login OTP',
      html
    });

    return res.json({
      success: true,
      otpRequired: true,
      message: 'OTP sent to your email. Please verify OTP to complete login.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


router.post('/forgot', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
  }

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Email is not registered' });

    const token = crypto.randomBytes(24).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    const emailSent = await sendResetEmail(email, token);
    if (emailSent) {
      return res.json({ success: true, message: 'Reset token has been sent to your email' });
    }

    return res.json({
      success: true,
      message: 'Email service not configured. Check reset token in backend console.',
      token
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/reset', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('token').trim().escape().notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
  }

  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ success: false, message: 'Saare fields bharein' });
    const user = await User.findOne({ email, resetPasswordToken: token, resetPasswordExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid ya expired token' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset. You can now login.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Email OTP Login ──
router.post('/otp/send', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['student','faculty','admin']).withMessage('Invalid role')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Email not registered' });

    // 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    user.otpCodeHash = otpHash;
    user.otpCodeExpiry = Date.now() + 1000 * 60 * 10; // 10 min
    await user.save();

    // Send via existing nodemailer SMTP settings (reuses auth.js SMTP env)
    // If SMTP is not configured, still return success but OTP will be logged server-side.
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@kdcampus.edu';

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      console.log(`OTP for ${email}: ${otp}`);
      return res.json({ success: true, message: 'OTP sent (check server logs).', otpSent: true });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    const html = `
      <p>Hi,</p>
      <p>Your KD Campus login OTP is:</p>
      <p style="font-size:20px;font-weight:bold;padding:12px 16px;background:#f4f6ff;border-radius:10px;display:inline-block">${otp}</p>
      <p>It is valid for 10 minutes.</p>
      <p>If you did not request this, ignore this email.</p>
      <p>Thanks,<br/>KD Campus Team</p>`;

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'KD Campus Login OTP',
      html
    });

    return res.json({ success: true, message: 'OTP sent to your email.', otpSent: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/otp/verify', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('otp').trim().escape().notEmpty().withMessage('OTP is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
  }

  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Email not registered' });

    if (!user.otpCodeHash || !user.otpCodeExpiry) {
      return res.status(400).json({ success: false, message: 'OTP not requested or expired' });
    }
    if (user.otpCodeExpiry.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (otpHash !== user.otpCodeHash) {
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    user.otpCodeHash = undefined;
    user.otpCodeExpiry = undefined;
    await user.save();

    if (!user.isApproved) return res.status(403).json({ success: false, message: 'Not approved by admin' });

    return res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token not provided' });
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set in environment variables');
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');
    res.json({ success: true, user });
  } catch (err) { res.status(401).json({ success: false, message: 'Token is invalid' }); }
});

module.exports = router;
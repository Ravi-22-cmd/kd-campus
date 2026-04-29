const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── User Model ──
const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  phone:      { type: String },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['student','faculty','admin'], default: 'student' },
  department: { type: String },
  avatar:     { type: String },
  isApproved: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Course Model ──
const courseSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  code:       { type: String, required: true, unique: true },
  department: { type: String },
  credits:    { type: Number, default: 4 },
  semester:   { type: Number },
  facultyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

// ── Attendance Model ──
const attendanceSchema = new mongoose.Schema({
  courseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  date:      { type: Date, default: Date.now },
  records: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status:    { type: String, enum: ['present','absent','late'], default: 'absent' },
  }]
}, { timestamps: true });

// ── Marks Model ──
const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  courseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  examType:  { type: String, enum: ['internal','midterm','external','assignment'], default: 'internal' },
  marks:     { type: Number, required: true },
  maxMarks:  { type: Number, required: true },
  semester:  { type: Number },
  remarks:   { type: String },
}, { timestamps: true });

// ── Assignment Model ──
const assignmentSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  courseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  facultyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  dueDate:     { type: Date, required: true },
  maxMarks:    { type: Number, default: 50 },
  submissions: [{
    studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date, default: Date.now },
    fileUrl:     { type: String },
    marks:       { type: Number },
    status:      { type: String, enum: ['submitted','graded','late'], default: 'submitted' },
  }]
}, { timestamps: true });

// ── Fee Model ──
const feeSchema = new mongoose.Schema({
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description:   { type: String, required: true },
  amount:        { type: Number, required: true },
  type:          { type: String, enum: ['tuition','hostel','library','exam','lab','sports','other'] },
  status:        { type: String, enum: ['paid','pending','overdue'], default: 'pending' },
  transactionId: { type: String },
  paymentMethod: { type: String },
  paidAt:        { type: Date },
  dueDate:       { type: Date },
  semester:      { type: Number },
}, { timestamps: true });

// ── Notice Model ──
const noticeSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  content:    { type: String, required: true },
  type:       { type: String, enum: ['general','exam','fee','holiday','event'], default: 'general' },
  postedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetRole: { type: String, enum: ['all','student','faculty'], default: 'all' },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

// ── Export all models ──
module.exports = {
  User:       mongoose.model('User',       userSchema),
  Course:     mongoose.model('Course',     courseSchema),
  Attendance: mongoose.model('Attendance', attendanceSchema),
  Marks:      mongoose.model('Marks',      marksSchema),
  Assignment: mongoose.model('Assignment', assignmentSchema),
  Fee:        mongoose.model('Fee',        feeSchema),
  Notice:     mongoose.model('Notice',     noticeSchema),
};
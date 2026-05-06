process.on('uncaughtException', e => console.log('CRASH:', e.message));
process.on('unhandledRejection', e => console.log('REJECT:', e));

process.env.MONGO_URI  = 'mongodb+srv://universeAdmin:sF3Blh0DHUCCjG0X@cluster0.dd9h6ro.mongodb.net/universeDB?appName=Cluster0';
process.env.JWT_SECRET = 'universe_super_secret_key_2026';
process.env.PORT       = process.env.PORT || '3000';

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const http     = require('http');
const { Server } = require('socket.io');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt      = require('jsonwebtoken');
const models   = require('./models/models');
const User     = models.User;
const Exam     = models.Exam;
const { protect } = require('./middleware/auth');


const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

io.engine.on('connection_error', (err) => {
  console.log('Socket handshake error:', err.message);
});

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

app.use(generalLimiter);

// Body size limit (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({ origin: '*' }));

// Serve face-api models
app.use('/models', express.static('models'));

// Apply auth limiter to auth routes
app.use('/api/auth', authLimiter);

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/students',    protect, require('./routes/students'));
app.use('/api/faculty',     protect, require('./routes/faculty'));
app.use('/api/courses',     protect, require('./routes/courses'));
app.use('/api/departments', protect, require('./routes/departments'));
app.use('/api/attendance',  protect, require('./routes/attendance'));
app.use('/api/marks',       protect, require('./routes/marks'));
app.use('/api/assignments', protect, require('./routes/assignments'));
app.use('/api/fees',        protect, require('./routes/fees'));
app.use('/api/notices',     protect, require('./routes/notices'));
app.use('/api/chat',        protect, require('./routes/chat'));
app.use('/api/chatbot',     protect, require('./routes/chatbot'));
app.use('/api/messages',    protect, require('./routes/messages'));
app.use('/api/announcements', protect, require('./routes/announcements'));
app.use('/api/profile',     protect, require('./routes/profile'));
app.use('/api/exams',       protect, require('./routes/exams'));

app.get('/', (req, res) => {
  res.json({ message: '🏛️ KD Campus Backend Running!', status: 'OK' });
});

// ── Track online users ──
const onlineUsers = {};

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('User not found'));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, socket.user.name);

  // User online ho gaya
  socket.on('user_online', (userId) => {
    if (socket.user._id.toString() !== userId) return; // Only allow own userId
    onlineUsers[userId] = socket.id;
    io.emit('online_users', Object.keys(onlineUsers));
    console.log('Online:', userId);
  });

  // 1-to-1 message
  socket.on('private_message', (data) => {
    const { senderId, senderName, receiverId, message, timestamp } = data;

    // Receiver ko message bhejo
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit('private_message', {
        senderId, senderName, receiverId, message, timestamp
      });
    }

    // Confirm sender too
    socket.emit('message_sent', { senderId, receiverId, message, timestamp });
  });

  // Group message (course ke sab)
  socket.on('join_group', (courseId) => {
    socket.join(`course_${courseId}`);
    console.log(`User joined group: course_${courseId}`);
  });

  socket.on('group_message', (data) => {
    const { courseId, senderId, senderName, message, timestamp } = data;
    io.to(`course_${courseId}`).emit('group_message', {
      courseId, senderId, senderName, message, timestamp
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const userId = Object.keys(onlineUsers).find(k => onlineUsers[k] === socket.id);
    if (userId) {
      delete onlineUsers[userId];
      io.emit('online_users', Object.keys(onlineUsers));
    }
    console.log('User disconnected:', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected!');

    // Create default admin if not exists
    const adminExists = await User.findOne({ email: 'admin@kdcampus.edu' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@kdcampus.edu',
        phone: '+91 9876543210',
        password: 'admin123',
        role: 'admin',
        department: 'IT',
        isApproved: true
      });
      console.log('✅ Default admin created: admin@kdcampus.edu / admin123');
    }

    const examCount = await Exam.countDocuments();
    if (examCount === 0) {
      await Exam.create([
        {
          title: 'Machine Learning Practice Test',
          course: 'Machine Learning',
          date: new Date('2026-06-05T10:00:00Z'),
          duration: 20,
          totalMarks: 100,
          description: 'Practice test for ML fundamentals and algorithms.',
          type: 'practice',
          questions: [
            { question: 'Which algorithm is used for classification tasks?', options: ['Linear Regression', 'K-Means', 'Logistic Regression', 'PCA'], answer: 2 },
            { question: 'What is overfitting?', options: ['Model performs well on new data', 'Model underfits training data', 'Model learns noise from training data', 'Model has too few parameters'], answer: 2 },
            { question: 'Which method reduces dimensionality?', options: ['Decision Tree', 'KNN', 'PCA', 'Naive Bayes'], answer: 2 },
            { question: 'What is the loss function for linear regression?', options: ['Cross entropy', 'Mean squared error', 'Hinge loss', 'Cosine similarity'], answer: 1 },
            { question: 'Which model is best for regression?', options: ['Naive Bayes', 'Linear Regression', 'K-Means', 'Apriori'], answer: 1 },
            { question: 'What does SGD stand for?', options: ['Stochastic Gradient Descent', 'Sequential Graph Descent', 'Single Gradient Decision', 'Sparse Gradient Descent'], answer: 0 },
            { question: 'Which dataset split is common?', options: ['70-30', '90-90', '10-90', '100-0'], answer: 0 },
            { question: 'Which is an ensemble method?', options: ['Random Forest', 'Linear Regression', 'KNN', 'PCA'], answer: 0 }
          ]
        },
        {
          title: 'DBMS Practice Quiz',
          course: 'Database Management Systems',
          date: new Date('2026-06-10T10:00:00Z'),
          duration: 15,
          totalMarks: 100,
          description: 'Practice quiz covering SQL, normalization, and database concepts.',
          type: 'practice',
          questions: [
            { question: 'Which SQL command removes rows from a table?', options: ['DELETE', 'UPDATE', 'CREATE', 'ALTER'], answer: 0 },
            { question: 'What is normalization?', options: ['Data encryption', 'Reducing redundancy', 'Increasing storage', 'Creating indexes'], answer: 1 },
            { question: 'Which normal form removes partial dependency?', options: ['1NF', '2NF', '3NF', 'BCNF'], answer: 1 },
            { question: 'Which key uniquely identifies a record?', options: ['Foreign key', 'Primary key', 'Candidate key', 'Alternate key'], answer: 1 },
            { question: 'What does ACID stand for?', options: ['Atomicity, Consistency, Isolation, Durability', 'Accuracy, Consistency, Integrity, Durability', 'Atomicity, Concurrency, Isolation, Durability', 'Availability, Consistency, Isolation, Durability'], answer: 0 },
            { question: 'Which SQL clause sorts results?', options: ['GROUP BY', 'ORDER BY', 'WHERE', 'HAVING'], answer: 1 }
          ]
        }
      ]);
      console.log('✅ Default exam seed data created');
    }

    server.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server + Socket.io on http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch(err => console.log('❌ MongoDB Error:', err.message));
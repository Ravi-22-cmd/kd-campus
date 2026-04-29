process.on('uncaughtException', e => console.log('CRASH:', e.message));
process.on('unhandledRejection', e => console.log('REJECT:', e));



const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const http     = require('http');
const { Server } = require('socket.io');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/students',    require('./routes/students'));
app.use('/api/faculty',     require('./routes/faculty'));
app.use('/api/courses',     require('./routes/courses'));
app.use('/api/attendance',  require('./routes/attendance'));
app.use('/api/marks',       require('./routes/marks'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/fees',        require('./routes/fees'));
app.use('/api/notices',     require('./routes/notices'));
app.use('/api/chat',        require('./routes/chat'));

app.get('/', (req, res) => {
  res.json({ message: '🏛️ KD Campus Backend Running!', status: 'OK' });
});

// ── Online users track karo ──
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User online ho gaya
  socket.on('user_online', (userId) => {
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

    // Sender ko bhi confirm karo
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
  .then(() => {
    console.log('✅ MongoDB Connected!');
    server.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server + Socket.io on http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch(err => console.log('❌ MongoDB Error:', err.message));
process.on('uncaughtException', e => console.log('CRASH:', e.message));
process.on('unhandledRejection', e => console.log('REJECT:', e));

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const app      = express();

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

app.get('/', (req, res) => {
  res.json({ message: '🏛️ UniVerse Backend Running!', status: 'OK' });
});

const MONGO = 'mongodb+srv://universeAdmin:sF3Blh0DHUCCjG0X@cluster0.dd9h6ro.mongodb.net/universeDB?appName=Cluster0';

console.log('Connecting to MongoDB...');

mongoose.connect(MONGO)
  .then(() => {
    console.log('✅ MongoDB Connected!');
app.listen(3000, () => console.log('🚀 Server on http://localhost:3000'));  })
  .catch(err => console.log('❌ MongoDB Error:', err.message));
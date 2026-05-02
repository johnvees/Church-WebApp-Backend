require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const verseRoutes = require('./routes/verses');
const bacaanRoutes = require('./routes/bacaan');
const memberRoutes = require('./routes/members');
const articleRoutes = require('./routes/articles');
const galleryRoutes = require('./routes/gallery');
const aboutRoutes = require('./routes/about');

connectDB();

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', process.env.FRONTEND_URL || '*'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/verses', verseRoutes);
app.use('/api/bacaan', bacaanRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/about', aboutRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Ekklesia API is running 🙏' }));
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} tidak ditemukan` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server berjalan di port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;

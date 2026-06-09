require('dotenv').config();
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const createMemberRoutes = require('./routes/members');
const galleryRoutes = require('./routes/gallery');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

function sanitize(obj) {
  if (typeof obj === 'string') return obj.replace(/<[^>]*>/g, '').trim().slice(0, 500);
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key === 'password' || key === 'file') continue;
      obj[key] = sanitize(obj[key]);
    }
  }
  return obj;
}
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) && !(req.body instanceof require('stream').Stream)) sanitize(req.body);
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth/login', loginLimiter);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/founders', createMemberRoutes('founders'));
app.use('/api/admins', createMemberRoutes('admins'));
app.use('/api/gallery', galleryRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database/db');
const { requireAuth } = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
  res.json({ url: '/uploads/' + req.file.filename });
});

router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM gallery ORDER BY sort_order ASC').all();
  res.json(items);
});

router.get('/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'No encontrado' });
  res.json(item);
});

router.post('/', requireAuth, (req, res) => {
  const { title, image_url } = req.body;
  if (!image_url) return res.status(400).json({ error: 'Imagen requerida' });
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM gallery').get();
  const result = db.prepare('INSERT INTO gallery (title, image_url, sort_order) VALUES (?, ?, ?)').run(title || '', image_url, (maxOrder.m || 0) + 1);
  res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  const { title, image_url, sort_order } = req.body;
  db.prepare('UPDATE gallery SET title=?, image_url=?, sort_order=? WHERE id=?').run(
    title ?? existing.title, image_url ?? existing.image_url, sort_order ?? existing.sort_order, req.params.id
  );
  res.json({ success: true });
});

router.delete('/:id', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'No encontrado' });
  res.json({ success: true });
});

module.exports = router;

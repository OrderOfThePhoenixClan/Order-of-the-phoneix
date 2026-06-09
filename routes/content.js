const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const sections = db.prepare('SELECT section, title, body, image_url FROM content').all();
  const result = {};
  sections.forEach(s => { result[s.section] = { title: s.title, body: s.body, image_url: s.image_url }; });
  res.json(result);
});

router.get('/:section', (req, res) => {
  const section = db.prepare('SELECT * FROM content WHERE section = ?').get(req.params.section);
  if (!section) return res.status(404).json({ error: 'Sección no encontrada' });
  res.json(section);
});

router.put('/:section', requireAuth, (req, res) => {
  const { title, body, image_url } = req.body;
  const result = db.prepare(`
    UPDATE content SET title = ?, body = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
    WHERE section = ?
  `).run(title || '', body || '', image_url || '', req.session.userId, req.params.section);

  if (result.changes === 0) return res.status(404).json({ error: 'Sección no encontrada' });
  res.json({ success: true });
});

module.exports = router;

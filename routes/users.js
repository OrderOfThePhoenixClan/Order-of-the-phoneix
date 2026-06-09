const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database/db');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const users = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY id ASC').all();
  res.json(users);
});

router.post('/', requireAuth, (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) return res.status(400).json({ error: 'El usuario ya existe' });
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hash, role || 'editor');
  res.json({ success: true, id: result.lastInsertRowid });
});

router.delete('/:id', requireAuth, (req, res) => {
  if (req.params.id == req.session.userId) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'No encontrado' });
  res.json({ success: true });
});

router.put('/:id/password', requireAuth, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Contraseña requerida' });
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.params.id);
  res.json({ success: true });
});

module.exports = router;

const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middlewares/auth');

function createMemberRoutes(table) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const members = db.prepare(`SELECT * FROM ${table} ORDER BY sort_order ASC`).all();
    res.json(members);
  });

  router.get('/:id', (req, res) => {
    const member = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!member) return res.status(404).json({ error: 'No encontrado' });
    res.json(member);
  });

  router.post('/', requireAuth, (req, res) => {
    const { name, nickname, country, role, photo_url, cover_url } = req.body;
    if (!name || !nickname) {
      return res.status(400).json({ error: 'Nombre y nickname requeridos' });
    }
    const maxOrder = db.prepare(`SELECT MAX(sort_order) as m FROM ${table}`).get();
    const result = db.prepare(
      `INSERT INTO ${table} (name, nickname, country, role, photo_url, cover_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(name, nickname, country || '', role || 'Miembro', photo_url || '', cover_url || '', (maxOrder.m || 0) + 1);
    res.json({ success: true, id: result.lastInsertRowid });
  });

  router.put('/:id', requireAuth, (req, res) => {
    const { name, nickname, country, role, photo_url, cover_url, sort_order } = req.body;
    const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'No encontrado' });
    db.prepare(
      `UPDATE ${table} SET name=?, nickname=?, country=?, role=?, photo_url=?, cover_url=?, sort_order=? WHERE id=?`
    ).run(
      name ?? existing.name, nickname ?? existing.nickname, country ?? existing.country,
      role ?? existing.role, photo_url ?? existing.photo_url, cover_url ?? existing.cover_url,
      sort_order ?? existing.sort_order, req.params.id
    );
    res.json({ success: true });
  });

  router.delete('/:id', requireAuth, (req, res) => {
    const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true });
  });

  return router;
}

module.exports = createMemberRoutes;

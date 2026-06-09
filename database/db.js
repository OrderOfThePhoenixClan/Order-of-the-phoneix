const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'editor',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT UNIQUE NOT NULL,
      title TEXT DEFAULT '',
      body TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_by INTEGER REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS founders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nickname TEXT NOT NULL,
      country TEXT DEFAULT '',
      role TEXT DEFAULT 'Fundador',
      photo_url TEXT DEFAULT '',
      cover_url TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nickname TEXT NOT NULL,
      country TEXT DEFAULT '',
      role TEXT DEFAULT 'Administrador',
      photo_url TEXT DEFAULT '',
      cover_url TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );
  `);

  const adminUser = db.prepare('SELECT id FROM users WHERE username = ?').get(process.env.ADMIN_USER);
  if (!adminUser) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASS, 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(process.env.ADMIN_USER, hash, 'admin');
    console.log('Usuario admin creado');
  }

  const sections = ['hero', 'about', 'dynamics', 'rules'];
  const insertSection = db.prepare('INSERT OR IGNORE INTO content (section, title, body) VALUES (?, ?, ?)');
  insertSection.run('hero', 'Order of the Phoenix', 'Renacemos de las cenizas para dominar la nave.');
  insertSection.run('about', '¿Quiénes somos?', 'Más que un clan, somos una hermandad forjada en el respeto y la sana convivencia.');
  insertSection.run('dynamics', 'Nuestras Dinámicas', '¡Estas son algunas de las dinamicas que realizamos entre semana y cada jueves!');
  insertSection.run('rules', 'Reglas del Clan', 'Código de convivencia para mantener el orden en la nave.');

  const founderCount = db.prepare('SELECT COUNT(*) as count FROM founders').get().count;
  if (founderCount === 0) {
    const insert = db.prepare('INSERT INTO founders (name, nickname, country, role, photo_url, cover_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insert.run('Anel Brillet', 'Kira', 'Mexico', 'Fundadora', 'https://i.ibb.co/Y7xGf6tB/kira.png', 'https://i.ibb.co/S7VVJQb6/Screenshot-2025-06-30-22-32-45-193-com-whatsapp.jpg', 1);
    insert.run('Lizzeth', 'Lizz', 'Honduras', 'Fundadora', 'https://i.ibb.co/C3KzxsDm/lizz.png', 'https://i.ibb.co/tMRdWJY3/Screenshot-2025-06-30-22-33-41-912-com-whatsapp.jpg', 2);
    insert.run('Cristian', 'Ares', 'Mexico', 'Fundador', 'https://i.ibb.co/cXX2QFKW/ares.png', 'https://i.ibb.co/hFcxdPG0/Screenshot-2025-06-30-22-34-20-530-com-whatsapp.jpg', 3);
    insert.run('Trini', 'Oisu', 'Mexico', 'Fundadora', 'https://i.ibb.co/dJrvxvkv/oisu.png', 'https://i.ibb.co/GvGDmk6n/Screenshot-2025-06-30-22-40-11-227-com-whatsapp.jpg', 4);
    insert.run('Alo', 'Loww', 'Mexico', 'Fundadora', 'https://i.ibb.co/KjkfWjfx/lowww.png', 'https://i.ibb.co/Qvnr3HsN/Screenshot-2025-06-30-22-25-41-653-com-whatsapp.jpg', 5);
    insert.run('Diana Laura', 'LauYee', 'Mexico', 'Fundadora', 'https://i.ibb.co/vxJVK88H/lau.png', 'https://i.ibb.co/JFs1LySL/Screenshot-2025-06-30-22-33-18-891-com-whatsapp.jpg', 6);
    insert.run('Rubi', 'Anakin', 'Mexico', 'Fundadora', 'https://i.ibb.co/b5wMkhB2/Rubi.png', 'https://i.ibb.co/wFpby2vV/Screenshot-2025-06-30-22-50-16-199-com-whatsapp.jpg', 7);
    console.log('Fundadores sembrados');
  }

  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
  if (adminCount === 0) {
    const insert = db.prepare('INSERT INTO admins (name, nickname, country, role, photo_url, cover_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insert.run('Trini', 'Oisu', 'Mexico', 'Administradora', 'https://i.ibb.co/nWT5mTy/phoenix.jpg', 'https://i.ibb.co/B5jSqPDb/oisu.jpg', 1);
    insert.run('Cristian', 'Ares', 'Mexico', 'Administrador', 'https://i.ibb.co/nWT5mTy/phoenix.jpg', 'https://i.ibb.co/LBCbmVz/ares.jpg', 2);
    insert.run('Anel Brillet', 'Kira', 'Mexico', 'Administradora', 'https://i.ibb.co/nWT5mTy/phoenix.jpg', 'https://i.ibb.co/ZRJ9xQVB/kira.jpg', 3);
    insert.run('Eduardo', 'Jasper', 'Ecuador', 'Administrador', 'https://i.ibb.co/nWT5mTy/phoenix.jpg', 'https://i.ibb.co/Ps8NTCq4/elarqui.jpg', 4);
    insert.run('Roxel', 'Roxy', 'Colombia', 'Administradora', 'https://i.ibb.co/nWT5mTy/phoenix.jpg', 'https://i.ibb.co/cSLfbzDh/roxyyy.jpg', 5);
    insert.run('Lizzeth', 'Lizz', 'Honduras', 'Administradora', 'https://i.ibb.co/nWT5mTy/phoenix.jpg', 'https://i.ibb.co/3YVyc8X8/lizzz.jpg', 6);
    insert.run('Souad', 'Lala', 'España', 'Host', 'https://i.ibb.co/nWT5mTy/phoenix.jpg', 'https://i.ibb.co/HfWBKLkd/lalalalala.jpg', 7);
    insert.run('Max', 'Max', 'Venezuela', 'Host', 'https://i.ibb.co/nWT5mTy/phoenix.jpg', 'https://i.ibb.co/LhCFL0X4/max.jpg', 8);
    insert.run('Alessander', 'Kold', 'Peru', 'Host', 'https://i.ibb.co/nWT5mTy/phoenix.jpg', 'https://i.ibb.co/mCVJx5ny/kold.jpg', 9);
    console.log('Admins sembrados');
  }

  const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery').get().count;
  if (galleryCount === 0) {
    const insert = db.prepare('INSERT INTO gallery (title, image_url, sort_order) VALUES (?, ?, ?)');
    insert.run('Dinámica Squid', 'https://i.ibb.co/VYb6LdwS/dinamica-squid.jpg', 1);
    insert.run('Modo Squid Games', 'https://i.ibb.co/tMxK28FD/squid.jpg', 2);
    insert.run('Modo Revolución', 'https://i.ibb.co/wZvkqMz0/Revolucion.jpg', 3);
    insert.run('Explicación Revolución', 'https://i.ibb.co/60jqgw5B/explicacion-revo.jpg', 4);
    insert.run('Cumpleaños Temáticos', 'https://i.ibb.co/RTwzwMX5/Cumplea-os.jpg', 5);
    insert.run('Impostor de la Semana', 'https://i.ibb.co/rKBMpYTk/Impostor-de-la-semana.jpg', 6);
    console.log('Galería sembrada');
  }
}

initDB();

module.exports = db;

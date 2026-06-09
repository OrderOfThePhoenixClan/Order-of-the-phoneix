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
  `);

  const adminUser = db.prepare('SELECT id FROM users WHERE username = ?').get(process.env.ADMIN_USER);
  if (!adminUser) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASS, 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(process.env.ADMIN_USER, hash, 'admin');
    console.log('Admin user created');
  }

  const sections = ['hero', 'about', 'dynamics', 'rules'];
  const insertSection = db.prepare('INSERT OR IGNORE INTO content (section, title, body) VALUES (?, ?, ?)');
  insertSection.run('hero', 'Order of the Phoenix', 'Renacemos de las cenizas para dominar la nave.');
  insertSection.run('about', '¿Quiénes somos?', 'Más que un clan, somos una hermandad forjada en el respeto y la sana convivencia.');
  insertSection.run('dynamics', 'Nuestras Dinámicas', 'Jueves: dinámicas únicas. Domingos: caos total. Cumpleaños: celebración familiar.');
  insertSection.run('rules', 'Reglas del Clan', 'Código de convivencia para mantener el orden en la nave.');
}

initDB();

module.exports = db;

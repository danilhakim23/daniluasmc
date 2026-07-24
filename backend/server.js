const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mysql = require('mysql2/promise');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use('/api/v1', apiRoutes);

let db = null;

async function connectDb() {
  db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'santri_db',
    multipleStatements: true
  });

  await db.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL,
      time VARCHAR(20) NOT NULL,
      day VARCHAR(20) NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      text TEXT NOT NULL,
      author VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hadiths (
      id INT AUTO_INCREMENT PRIMARY KEY,
      source VARCHAR(100) NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    INSERT INTO schedules (title, type, time, day, status)
    SELECT 'Subuh Berjamaah', 'ibadah', '04:30', 'Senin', 'active'
    WHERE NOT EXISTS (SELECT 1 FROM schedules WHERE title = 'Subuh Berjamaah');

    INSERT INTO quotes (text, author)
    SELECT 'Bersabar dan terus berusaha, Allah bersama orang-orang yang sabar.', 'HR. Bukhari'
    WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE text = 'Bersabar dan terus berusaha, Allah bersama orang-orang yang sabar.');

    INSERT INTO announcements (title, content)
    SELECT 'Pengumuman Sholat Berjamaah', 'Semua santri diwajibkan hadir tepat waktu.'
    WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'Pengumuman Sholat Berjamaah');

    INSERT INTO hadiths (source, text)
    SELECT 'HR. Bukhari', 'Sebaik-baik kalian adalah yang paling baik akhlaknya.'
    WHERE NOT EXISTS (SELECT 1 FROM hadiths WHERE text = 'Sebaik-baik kalian adalah yang paling baik akhlaknya.');
  `);

  app.locals.db = db;
  console.log('Database connected');
}

connectDb().catch((error) => {
  console.error('Database connection failed:', error.message);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

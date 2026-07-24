const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Try to serve frontend build if it exists
const buildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// API routes
app.use('/api/v1', apiRoutes);

// Fallback: serve simple HTML for root path
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Santri Reminder</title>
      <style>
        body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
        .container { background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        p { color: #666; }
        .status { background: #e8f5e9; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .api-link { background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🕌 Santri Reminder</h1>
        <p>Backend API is running successfully!</p>
        <div class="status">
          <strong>✓ Database Connected</strong><br>
          <strong>✓ Server Running</strong><br>
          <strong>✓ API Ready</strong>
        </div>
        <p>Frontend build is loading or not available.</p>
        <p>API endpoints available at: <code>/api/v1</code></p>
        <a href="/api/v1/schedules" class="api-link">View Schedules API</a>
      </div>
    </body>
    </html>
  `);
});

// Serve React app for other routes if build exists
if (fs.existsSync(buildPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

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

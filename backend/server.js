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

console.log('[Server] Starting...');
console.log('[Server] DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('[Server] DB_NAME:', process.env.DB_NAME || 'santri_db');

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Try to serve frontend build if it exists
const buildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(buildPath)) {
  console.log('[Server] Frontend build found at', buildPath);
  app.use(express.static(buildPath));
} else {
  console.log('[Server] Frontend build not found');
}

// API routes
app.use('/api/v1', apiRoutes);

// Root path - simple health check
app.get('/', (req, res) => {
  const dbStatus = app.locals.db ? '✓' : '✗';
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Santri Reminder - Backend</title>
      <style>
        body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
        .container { background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; margin: 0; }
        .status { margin: 20px 0; padding: 15px; border-radius: 4px; }
        .ready { background: #e8f5e9; color: #2e7d32; }
        .pending { background: #fff3e0; color: #e65100; }
        .error { background: #ffebee; color: #c62828; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🕌 Santri Reminder Backend</h1>
        <div class="status ${app.locals.db ? 'ready' : 'pending'}">
          <strong>${dbStatus} Database: ${app.locals.db ? 'Connected' : 'Connecting...'}</strong>
        </div>
        <p>API available at <code>/api/v1</code></p>
        <p style="color: #999; font-size: 12px;">Server time: ${new Date().toISOString()}</p>
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
  try {
    console.log('[Database] Connecting...');
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'santri_db',
      multipleStatements: true,
      connectionLimit: 1,
      waitForConnections: true,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0
    });

    console.log('[Database] Connected successfully');

    // Create tables
    console.log('[Database] Creating tables...');
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

    console.log('[Database] Tables ready');

    // Seed initial data
    console.log('[Database] Seeding data...');
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

    console.log('[Database] Data seeded');
    app.locals.db = db;
  } catch (error) {
    console.error('[Database] Connection error:', error.message);
    console.error('[Database] Stack:', error.stack);
    // Don't crash the server, try again later
  }
}

// Start server immediately
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Access at http://localhost:${PORT}`);
});

// Connect to database in background
connectDb().catch((error) => {
  console.error('[Database] Fatal error:', error.message);
});

// Handle server errors
server.on('error', (error) => {
  console.error('[Server] Error:', error.message);
});

process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, closing gracefully...');
  server.close(() => {
    console.log('[Server] Closed');
    process.exit(0);
  });
});


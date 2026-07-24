const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mysql = require('mysql2/promise');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('[START] Initializing server...');
console.log('[CONFIG] PORT:', PORT);
console.log('[CONFIG] DB_HOST:', process.env.DB_HOST);
console.log('[CONFIG] DB_NAME:', process.env.DB_NAME);

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// API routes first
app.use('/api/v1', apiRoutes);

// Simple root response
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Santri Reminder Backend API',
    dbConnected: !!app.locals.db,
    timestamp: new Date().toISOString()
  });
});

// Database connection in background (non-blocking)
let db = null;

async function connectDb() {
  try {
    console.log('[DB] Connecting...');
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });
    
    console.log('[DB] Connected!');
    
    // Create tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        time VARCHAR(20) NOT NULL,
        day VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        text TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS hadiths (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('[DB] Tables created');

    // Insert sample data
    await db.query(`
      INSERT IGNORE INTO schedules (title, type, time, day, status) 
      VALUES ('Subuh Berjamaah', 'ibadah', '04:30', 'Senin', 'active')
    `);

    app.locals.db = db;
    console.log('[DB] Ready');
  } catch (err) {
    console.error('[DB] Error:', err.message);
  }
}

// Start server immediately
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Running on port ${PORT}`);
  console.log(`[SERVER] Visit http://localhost:${PORT}`);
  
  // Connect to DB in background
  connectDb();
});



const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mysql = require('mysql2/promise');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running' });
});

// API routes
app.use('/api/v1', apiRoutes);

// Connect to database
let db = null;

function parseDatabaseUrl(url) {
  try {
    const dbUrl = new URL(url);
    return {
      host: dbUrl.hostname,
      port: Number(dbUrl.port) || 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname?.slice(1)
    };
  } catch (err) {
    console.error('Invalid DATABASE_URL:', err.message);
    return {};
  }
}

function getDatabaseConfig() {
  const config = {
    host: process.env.DB_HOST || process.env.MYSQL_HOST,
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT) || 3306,
    user: process.env.DB_USER || process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE
  };

  const url = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.RAILWAY_DATABASE_URL;
  if ((!config.host || !config.user || !config.password || !config.database) && url) {
    const parsed = parseDatabaseUrl(url);
    config.host = config.host || parsed.host;
    config.port = config.port || parsed.port;
    config.user = config.user || parsed.user;
    config.password = config.password || parsed.password;
    config.database = config.database || parsed.database;
  }

  return config;
}

async function initDb() {
  try {
    const dbConfig = getDatabaseConfig();

    if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
      throw new Error(
        `Missing database configuration. Set DB_HOST/DB_USER/DB_PASSWORD/DB_NAME or MYSQL_HOST/MYSQL_USER/MYSQL_PASSWORD/MYSQL_DATABASE, or provide DATABASE_URL.`
      );
    }

    db = await mysql.createConnection({
      ...dbConfig,
      multipleStatements: true
    });
    
    // Create tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100),
        type VARCHAR(50),
        time VARCHAR(20),
        day VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        text TEXT,
        author VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS hadiths (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source VARCHAR(100),
        text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      INSERT IGNORE INTO schedules (title, type, time, day, status) 
      VALUES ('Subuh Berjamaah', 'ibadah', '04:30', 'Senin', 'active')
    `);

    app.locals.db = db;
    console.log('Database connected');
  } catch (err) {
    console.error('Database error:', err.message);
  }
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  initDb();
});




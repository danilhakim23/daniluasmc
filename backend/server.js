process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.stack || err.message || err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err?.stack || err?.message || err);
});

console.log('=== Santri Reminder NJ Backend ===');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());
console.log('Script directory:', __dirname);

let express, cors, helmet, mysql, path, fs;

try {
  express = require('express');
  cors = require('cors');
  helmet = require('helmet');
  mysql = require('mysql2/promise');
  path = require('path');
  fs = require('fs');
  console.log('All modules loaded successfully');
} catch (err) {
  console.error('FATAL: Failed to load module:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
}

try {
  require('dotenv').config();
} catch (err) {
  console.log('dotenv not available or no .env file, using environment variables');
}

let apiRoutes;
try {
  apiRoutes = require('./routes/api');
  console.log('API routes loaded');
} catch (err) {
  console.error('FATAL: Failed to load API routes:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const buildPath = path.join(__dirname, '../frontend/build');
let hasFrontend = false;
try {
  hasFrontend = fs.existsSync(buildPath);
} catch (err) {
  console.log('Could not check for frontend build:', err.message);
}

if (hasFrontend) {
  app.use(express.static(buildPath));
  console.log('Serving frontend from:', buildPath);
} else {
  console.log('Frontend build not found — serving API only');
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running', timestamp: new Date().toISOString() });
});

app.use('/api/v1', apiRoutes);

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/') && hasFrontend) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else if (!req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not found' });
  }
});

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
    host: process.env.DB_HOST || process.env.MYSQL_HOST || process.env.MYSQLHOST,
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || process.env.MYSQLPORT) || 3306,
    user: process.env.DB_USER || process.env.MYSQL_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE
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

async function initDb(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const dbConfig = getDatabaseConfig();

      if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
        throw new Error(
          'Missing database configuration. Set DATABASE_URL or individual DB_HOST/DB_USER/DB_PASSWORD/DB_NAME vars.'
        );
      }

      console.log(`Database connection attempt ${i + 1}/${retries}... host=${dbConfig.host} db=${dbConfig.database}`);

      const pool = mysql.createPool({
        ...dbConfig,
        multipleStatements: true,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();

      await pool.query(`
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

      await pool.query(`
        CREATE TABLE IF NOT EXISTS quotes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          text TEXT,
          author VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS announcements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(100),
          content TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS hadiths (
          id INT AUTO_INCREMENT PRIMARY KEY,
          source VARCHAR(100),
          text TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        INSERT IGNORE INTO schedules (title, type, time, day, status) 
        VALUES ('Subuh Berjamaah', 'ibadah', '04:30', 'Senin', 'active')
      `);

      app.locals.db = pool;
      console.log('Database connected and tables initialized');
      return;
    } catch (err) {
      console.error(`Database connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  console.error('All database connection attempts failed — server running without DB');
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
  console.log('DB env check:', {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || process.env.MYSQLHOST || 'NOT SET',
    user: process.env.DB_USER || process.env.MYSQL_USER || process.env.MYSQLUSER || 'NOT SET',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'NOT SET',
    hasDatabaseUrl: !!(process.env.DATABASE_URL || process.env.MYSQL_URL)
  });
  initDb();
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});

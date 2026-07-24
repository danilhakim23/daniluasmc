CREATE DATABASE IF NOT EXISTS santri_db;
USE santri_db;

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

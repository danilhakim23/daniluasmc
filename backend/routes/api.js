const express = require('express');
const router = express.Router();

const statistics = {
  activeStudents: 128,
  dailyDiscipline: 92,
  taskCompletion: 87,
  scheduleCompletion: 81,
  weeklyTrend: [70, 78, 82, 85, 88, 90, 92]
};

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/schedules', async (req, res) => {
  try {
    if (!req.app.locals.db) {
      return res.status(503).json({ message: 'Database is not ready yet' });
    }
    const [rows] = await req.app.locals.db.query('SELECT * FROM schedules ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/schedules', async (req, res) => {
  try {
    if (!req.app.locals.db) {
      return res.status(503).json({ message: 'Database is not ready yet' });
    }
    const { title, type, time, day, status } = req.body;
    const [result] = await req.app.locals.db.query(
      'INSERT INTO schedules (title, type, time, day, status) VALUES (?, ?, ?, ?, ?)',
      [title, type, time, day, status || 'active']
    );
    res.status(201).json({ id: result.insertId, title, type, time, day, status: status || 'active' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/schedules/:id', async (req, res) => {
  try {
    if (!req.app.locals.db) {
      return res.status(503).json({ message: 'Database is not ready yet' });
    }
    const scheduleId = Number(req.params.id);
    const { title, type, time, day, status } = req.body;
    await req.app.locals.db.query(
      'UPDATE schedules SET title = ?, type = ?, time = ?, day = ?, status = ? WHERE id = ?',
      [title, type, time, day, status, scheduleId]
    );
    res.json({ id: scheduleId, title, type, time, day, status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/schedules/:id', async (req, res) => {
  try {
    if (!req.app.locals.db) {
      return res.status(503).json({ message: 'Database is not ready yet' });
    }
    const scheduleId = Number(req.params.id);
    await req.app.locals.db.query('DELETE FROM schedules WHERE id = ?', [scheduleId]);
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/quotes', async (req, res) => {
  try {
    if (!req.app.locals.db) {
      return res.status(503).json({ message: 'Database is not ready yet' });
    }
    const [rows] = await req.app.locals.db.query('SELECT * FROM quotes ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/quotes', async (req, res) => {
  try {
    if (!req.app.locals.db) {
      return res.status(503).json({ message: 'Database is not ready yet' });
    }
    const { text, author } = req.body;
    const [result] = await req.app.locals.db.query('INSERT INTO quotes (text, author) VALUES (?, ?)', [text, author]);
    res.status(201).json({ id: result.insertId, text, author });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/announcements', async (req, res) => {
  try {
    if (!req.app.locals.db) {
      return res.status(503).json({ message: 'Database is not ready yet' });
    }
    const [rows] = await req.app.locals.db.query('SELECT * FROM announcements ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/announcements', async (req, res) => {
  try {
    if (!req.app.locals.db) {
      return res.status(503).json({ message: 'Database is not ready yet' });
    }
    const { title, content } = req.body;
    const [result] = await req.app.locals.db.query('INSERT INTO announcements (title, content) VALUES (?, ?)', [title, content]);
    res.status(201).json({ id: result.insertId, title, content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/hadiths', async (req, res) => {
  try {
    if (!req.app.locals.db) {
      return res.status(503).json({ message: 'Database is not ready yet' });
    }
    const [rows] = await req.app.locals.db.query('SELECT * FROM hadiths ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/hadiths', async (req, res) => {
  try {
    if (!req.app.locals.db) {
      return res.status(503).json({ message: 'Database is not ready yet' });
    }
    const { source, text } = req.body;
    const [result] = await req.app.locals.db.query('INSERT INTO hadiths (source, text) VALUES (?, ?)', [source, text]);
    res.status(201).json({ id: result.insertId, source, text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/statistics', (req, res) => {
  res.json(statistics);
});

module.exports = router;

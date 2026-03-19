const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// PUBLIC: Get all content
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM site_content');
    const content = {};
    rows.forEach(row => {
      content[row.key] = { al: row.value_al, en: row.value_en };
    });
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Update content
router.put('/admin', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { items } = req.body;
    await conn.beginTransaction();
    for (const item of items) {
      await conn.query(
        'UPDATE site_content SET value_al = ?, value_en = ? WHERE `key` = ?',
        [item.value_al, item.value_en, item.key]
      );
    }
    await conn.commit();
    res.json({ message: 'Content updated' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;

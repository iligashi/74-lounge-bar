const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// PUBLIC: Create reservation
router.post('/', async (req, res) => {
  try {
    const { customer_name, phone, date, time, guests, notes } = req.body;
    if (!customer_name || !phone || !date || !time || !guests) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }
    const [result] = await pool.query(
      'INSERT INTO reservations (customer_name, phone, date, time, guests, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_name, phone, date, time, parseInt(guests), notes || '']
    );
    res.json({ id: result.insertId, message: 'Reservation request submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Get all reservations
router.get('/admin', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];

    let where = '';
    if (status) {
      where = ' WHERE status = ?';
      params.push(status);
    }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM reservations${where}`, params);
    const [reservations] = await pool.query(
      `SELECT * FROM reservations${where} ORDER BY date DESC, time DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ reservations, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Update reservation status
router.put('/admin/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.query('UPDATE reservations SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Reservation status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Get reservation stats
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM reservations');
    const [[{ todayCount }]] = await pool.query('SELECT COUNT(*) as todayCount FROM reservations WHERE date = ?', [today]);
    const [[{ pending }]] = await pool.query("SELECT COUNT(*) as pending FROM reservations WHERE status = 'pending'");
    const [[{ upcoming }]] = await pool.query("SELECT COUNT(*) as upcoming FROM reservations WHERE date >= ? AND status = 'confirmed'", [today]);

    res.json({ total, today: todayCount, pending, upcoming });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

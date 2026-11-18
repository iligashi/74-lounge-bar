const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { parseOrderLines, priceOrder, OrderValidationError } = require('../lib/order-pricing');

const router = express.Router();

// PUBLIC: Create order. Prices and names always come from the database;
// anything the client sends for them is ignored.
router.post('/', async (req, res) => {
  const { customer_name, phone, table_number, notes, items } = req.body;

  if (typeof customer_name !== 'string' || !customer_name.trim() || typeof phone !== 'string' || !phone.trim()) {
    return res.status(400).json({ error: 'Name, phone, and at least one item required' });
  }

  let lines;
  try {
    lines = parseOrderLines(items);
  } catch (err) {
    return res.status(400).json({ error: err instanceof OrderValidationError ? err.message : 'Invalid order' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [menuRows] = await conn.query(
      'SELECT id, name_al, price, is_available FROM menu_items WHERE id IN (?)',
      [lines.map((l) => l.menuItemId)]
    );
    const order = priceOrder(lines, menuRows);
    const orderNumber = 'ORD-' + uuidv4().slice(0, 8).toUpperCase();

    const [result] = await conn.query(
      'INSERT INTO orders (order_number, customer_name, phone, table_number, notes, total) VALUES (?, ?, ?, ?, ?, ?)',
      [
        orderNumber,
        customer_name.trim().slice(0, 255),
        phone.trim().slice(0, 50),
        String(table_number || '').slice(0, 20),
        String(notes || '').slice(0, 2000),
        order.total,
      ]
    );
    const orderId = result.insertId;

    await conn.query(
      'INSERT INTO order_items (order_id, menu_item_id, item_name, item_price, quantity) VALUES ?',
      [order.items.map((item) => [orderId, item.menuItemId, item.name, item.unitPrice, item.quantity])]
    );

    await conn.commit();
    res.json({ id: orderId, order_number: orderNumber, total: order.total, message: 'Order placed successfully' });
  } catch (err) {
    await conn.rollback();
    if (err instanceof OrderValidationError) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// ADMIN: Get all orders
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

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM orders${where}`, params);

    const [orders] = await pool.query(
      `SELECT * FROM orders${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Attach items
    for (const order of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }

    res.json({ orders, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Update order status
router.put('/admin/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'preparing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Get order stats
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM orders');
    const [[{ todayCount }]] = await pool.query('SELECT COUNT(*) as todayCount FROM orders WHERE DATE(created_at) = ?', [today]);
    const [[{ pending }]] = await pool.query("SELECT COUNT(*) as pending FROM orders WHERE status = 'pending'");
    const [[{ preparing }]] = await pool.query("SELECT COUNT(*) as preparing FROM orders WHERE status = 'preparing'");
    const [[{ todayRevenue }]] = await pool.query("SELECT COALESCE(SUM(total), 0) as todayRevenue FROM orders WHERE DATE(created_at) = ? AND status != 'cancelled'", [today]);

    res.json({ total, today: todayCount, pending, preparing, todayRevenue: parseFloat(todayRevenue) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

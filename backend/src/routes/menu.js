const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// PUBLIC: Get all categories with items
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM menu_categories WHERE is_active = 1 ORDER BY sort_order ASC');
    const [items] = await pool.query('SELECT * FROM menu_items WHERE is_available = 1 ORDER BY sort_order ASC');
    const result = categories.map(cat => ({
      ...cat,
      items: items.filter(item => item.category_id === cat.id)
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUBLIC: Get featured items
router.get('/featured', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT mi.*, mc.name_al as category_name_al, mc.name_en as category_name_en
      FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.is_featured = 1 AND mi.is_available = 1
      ORDER BY mi.sort_order ASC
    `);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Get all categories
router.get('/admin/categories', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_categories ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Create category
router.post('/admin/categories', auth, async (req, res) => {
  try {
    const { name_al, name_en, description_al, description_en, sort_order } = req.body;
    const [result] = await pool.query(
      'INSERT INTO menu_categories (name_al, name_en, description_al, description_en, sort_order) VALUES (?, ?, ?, ?, ?)',
      [name_al, name_en, description_al || '', description_en || '', sort_order || 0]
    );
    res.json({ id: result.insertId, message: 'Category created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Update category
router.put('/admin/categories/:id', auth, async (req, res) => {
  try {
    const { name_al, name_en, description_al, description_en, sort_order, is_active } = req.body;
    await pool.query(
      'UPDATE menu_categories SET name_al=?, name_en=?, description_al=?, description_en=?, sort_order=?, is_active=? WHERE id=?',
      [name_al, name_en, description_al || '', description_en || '', sort_order || 0, is_active ?? 1, req.params.id]
    );
    res.json({ message: 'Category updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Delete category
router.delete('/admin/categories/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Get all items
router.get('/admin/items', auth, async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT mi.*, mc.name_al as category_name_al, mc.name_en as category_name_en
      FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      ORDER BY mc.sort_order ASC, mi.sort_order ASC
    `);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Create item
router.post('/admin/items', auth, async (req, res) => {
  try {
    const { category_id, name_al, name_en, description_al, description_en, price, image, is_featured, sort_order } = req.body;
    const [result] = await pool.query(
      'INSERT INTO menu_items (category_id, name_al, name_en, description_al, description_en, price, image, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [category_id, name_al, name_en, description_al || '', description_en || '', price, image || '', is_featured || 0, sort_order || 0]
    );
    res.json({ id: result.insertId, message: 'Item created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Update item
router.put('/admin/items/:id', auth, async (req, res) => {
  try {
    const { category_id, name_al, name_en, description_al, description_en, price, image, is_available, is_featured, sort_order } = req.body;
    await pool.query(
      'UPDATE menu_items SET category_id=?, name_al=?, name_en=?, description_al=?, description_en=?, price=?, image=?, is_available=?, is_featured=?, sort_order=? WHERE id=?',
      [category_id, name_al, name_en, description_al || '', description_en || '', price, image || '', is_available ?? 1, is_featured || 0, sort_order || 0, req.params.id]
    );
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN: Delete item
router.delete('/admin/items/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

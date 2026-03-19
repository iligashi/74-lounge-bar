require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function start() {
  // Create database if not exists
  const initConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT) || 3306,
  });
  await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || '74_lounge_bar'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await initConn.end();

  // Now connect to the database
  const pool = require('./config/database');

  // Run migrations
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name_al VARCHAR(255) NOT NULL,
      name_en VARCHAR(255) NOT NULL,
      description_al TEXT DEFAULT (''),
      description_en TEXT DEFAULT (''),
      sort_order INT DEFAULT 0,
      is_active TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      name_al VARCHAR(255) NOT NULL,
      name_en VARCHAR(255) NOT NULL,
      description_al TEXT,
      description_en TEXT,
      price DECIMAL(10,2) NOT NULL,
      image VARCHAR(500) DEFAULT '',
      is_available TINYINT DEFAULT 1,
      is_featured TINYINT DEFAULT 0,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      table_number VARCHAR(20) DEFAULT '',
      notes TEXT,
      status ENUM('pending','preparing','completed','cancelled') DEFAULT 'pending',
      total DECIMAL(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      menu_item_id INT,
      item_name VARCHAR(255) NOT NULL,
      item_price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      time VARCHAR(10) NOT NULL,
      guests INT NOT NULL,
      notes TEXT,
      status ENUM('pending','confirmed','rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`key\` VARCHAR(100) UNIQUE NOT NULL,
      value_al TEXT,
      value_en TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Seed admin
  const [admins] = await pool.query('SELECT id FROM admin_users WHERE username = ?', ['admin']);
  if (admins.length === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    await pool.query('INSERT INTO admin_users (username, password) VALUES (?, ?)', ['admin', hash]);
    console.log('Default admin created: admin / admin123');
  }

  // Seed content
  const contentDefaults = [
    ['hero_title', '74 Lounge Bar', '74 Lounge Bar'],
    ['hero_subtitle', 'Ku eleganca takon shijen', 'Where elegance meets taste'],
    ['about_title', 'Rreth Nesh', 'About Us'],
    ['about_text', 'Mirë se vini në 74 Lounge Bar, destinacioni juaj premium për përvojë të jashtëzakonshme në zemër të qytetit. Me një atmosferë elegante dhe shërbim të shkëlqyer, ne ofrojmë një ambient unik ku mund të shijoni pijet më të mira dhe kuzhinën e rafinuar.', 'Welcome to 74 Lounge Bar, your premium destination for an extraordinary experience in the heart of the city. With an elegant atmosphere and excellent service, we offer a unique ambiance where you can enjoy the finest drinks and refined cuisine.'],
    ['address', 'Rruga Kryesore, Nr. 74, Prishtinë', 'Main Street, No. 74, Prishtina'],
    ['phone', '+383 44 123 456', '+383 44 123 456'],
    ['email', 'info@74loungebar.com', 'info@74loungebar.com'],
    ['opening_hours', 'E Hënë - E Enjte: 08:00 - 23:00\nE Premte - E Shtunë: 08:00 - 01:00\nE Dielë: 10:00 - 22:00', 'Monday - Thursday: 08:00 - 23:00\nFriday - Saturday: 08:00 - 01:00\nSunday: 10:00 - 22:00'],
    ['facebook', 'https://facebook.com/74loungebar', 'https://facebook.com/74loungebar'],
    ['instagram', 'https://instagram.com/74loungebar', 'https://instagram.com/74loungebar'],
  ];
  for (const [key, al, en] of contentDefaults) {
    await pool.query('INSERT IGNORE INTO site_content (`key`, value_al, value_en) VALUES (?, ?, ?)', [key, al, en]);
  }

  // Seed menu
  const [cats] = await pool.query('SELECT id FROM menu_categories LIMIT 1');
  if (cats.length === 0) {
    const catData = [
      ['Kokteje', 'Cocktails', 'Kokteje të përgatitura me kujdes', 'Carefully crafted cocktails', 1],
      ['Pije të Ngrohta', 'Hot Drinks', 'Kafe dhe çaj premium', 'Premium coffee and tea', 2],
      ['Ushqime', 'Food', 'Kuzhinë e rafinuar', 'Refined cuisine', 3],
      ['Verëra', 'Wines', 'Verëra të zgjedhura', 'Selected wines', 4],
      ['Deserte', 'Desserts', 'Ëmbëlsira të shijshme', 'Delicious sweets', 5],
    ];
    const itemsByCat = [
      [
        ['Espresso Martini', 'Espresso Martini', 'Vodkë, likër kafeje, espresso i freskët', 'Vodka, coffee liqueur, fresh espresso', 7.50, 1],
        ['Negroni', 'Negroni', 'Xhin, vermut i kuq, Campari', 'Gin, sweet vermouth, Campari', 8.00, 1],
        ['Old Fashioned', 'Old Fashioned', 'Bourbon, sheqer, bitters, lëkurë portokalli', 'Bourbon, sugar, bitters, orange peel', 8.50, 0],
        ['Mojito', 'Mojito', 'Rum, mentë e freskët, limë, sheqer', 'Rum, fresh mint, lime, sugar', 7.00, 0],
      ],
      [
        ['Espresso', 'Espresso', 'Kafe espresso italiane', 'Italian espresso coffee', 2.00, 0],
        ['Cappuccino', 'Cappuccino', 'Espresso me qumësht të avulluar dhe shkumë', 'Espresso with steamed milk and foam', 3.00, 1],
        ['Macchiato', 'Macchiato', 'Espresso me një pikë qumësht', 'Espresso with a dash of milk', 2.50, 0],
        ['Çaj Premium', 'Premium Tea', 'Përzgjedhje çajrash organik', 'Selection of organic teas', 3.00, 0],
      ],
      [
        ['Bruschetta Klasike', 'Classic Bruschetta', 'Bukë e thekur me domate, hudhër dhe borzilok', 'Toasted bread with tomato, garlic and basil', 5.50, 1],
        ['Tavë me Djathë', 'Cheese Platter', 'Përzgjedhje djathrash premium me mjalte', 'Selection of premium cheeses with honey', 9.00, 0],
        ['Club Sandwich', 'Club Sandwich', 'Pulë, proshutë, djathë, sallat, domate', 'Chicken, prosciutto, cheese, lettuce, tomato', 7.50, 0],
        ['Pasta Carbonara', 'Pasta Carbonara', 'Spaghetti me pancetë, vezë dhe djathë', 'Spaghetti with pancetta, egg and cheese', 8.50, 1],
      ],
      [
        ['Verë e Kuqe Shtëpiake', 'House Red Wine', 'Verë e kuqe premium, gotë', 'Premium red wine, glass', 4.50, 0],
        ['Verë e Bardhë Shtëpiake', 'House White Wine', 'Verë e bardhë e freskët, gotë', 'Fresh white wine, glass', 4.50, 0],
        ['Prosecco', 'Prosecco', 'Prosecco italiano, gotë', 'Italian Prosecco, glass', 5.00, 0],
      ],
      [
        ['Tiramisu', 'Tiramisu', 'Tiramisu klasik italian', 'Classic Italian tiramisu', 5.00, 1],
        ['Cheesecake', 'Cheesecake', 'Cheesecake me fruta të pyllit', 'Cheesecake with forest fruits', 5.50, 0],
        ['Panna Cotta', 'Panna Cotta', 'Panna cotta me karamel', 'Panna cotta with caramel', 4.50, 0],
      ],
    ];

    for (let i = 0; i < catData.length; i++) {
      const [result] = await pool.query(
        'INSERT INTO menu_categories (name_al, name_en, description_al, description_en, sort_order) VALUES (?, ?, ?, ?, ?)',
        catData[i]
      );
      const catId = result.insertId;
      for (let j = 0; j < itemsByCat[i].length; j++) {
        const item = itemsByCat[i][j];
        await pool.query(
          'INSERT INTO menu_items (category_id, name_al, name_en, description_al, description_en, price, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [catId, ...item, j + 1]
        );
      }
    }
    console.log('Menu seeded.');
  }

  // Express app
  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/menu', require('./routes/menu'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/reservations', require('./routes/reservations'));
  app.use('/api/content', require('./routes/content'));
  app.use('/api/upload', require('./routes/upload'));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

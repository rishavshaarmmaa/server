const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');  // Add this line at the top


const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Br01pb5137@',  // Replace with your MySQL password
  database: 'restaurant_db',   // Replace with your database name
});

// Route for the root URL ("/")
app.use(express.static(path.join(__dirname, '../public')));

// Serve login.html as the default page


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../view/login.html'));  // Ensure the path is correct
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..views/login.html'));  // Ensure correct path
  }); 
// Serve other pages
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'index.html'));  // Serving the login page
  });

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'admin.html'));  // Serving the login page
  });

app.get('/cart.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../view/cart.html'));
});

app.get('/order_status.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../view/order_status.html'));
});

// === Menu Routes ===

// Fetch all menu items
app.get('/menu', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM menu');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching menu items');
  }
});

// Add a new menu item (Admin)
app.post('/menu', async (req, res) => {
  try {
    const { name, price, category } = req.body;
    await db.query('INSERT INTO menu (name, price, category) VALUES (?, ?, ?)', [name, price, category]);
    res.status(201).send('Menu item added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding menu item');
  }
});

// Delete a menu item (Admin)
app.delete('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM menu WHERE id = ?', [id]);
    res.status(200).send('Menu item deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting menu item');
  }
});

// === Cart Routes ===

// Fetch all items in the cart
app.get('/cart', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cart.id, menu.name, menu.price
      FROM cart
      JOIN menu ON cart.item_id = menu.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching cart items');
  }
});

// Add an item to the cart
app.post('/cart', async (req, res) => {
  try {
    const { itemId } = req.body;
    await db.query('INSERT INTO cart (item_id) VALUES (?)', [itemId]);
    res.status(201).send('Item added to cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding item to cart');
  }
});

// Remove an item from the cart
app.delete('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM cart WHERE id = ?', [id]);
    res.status(200).send('Item removed from cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error removing item from cart');
  }
});

// === Order Routes ===

// Place an order
app.post('/order', async (req, res) => {
  try {
    const [cartItems] = await db.query('SELECT item_id FROM cart');
    if (cartItems.length === 0) {
      return res.status(400).send('Cart is empty');
    }

    const [orderResult] = await db.query('INSERT INTO orders (status) VALUES ("Pending")');
    const orderId = orderResult.insertId;

    const values = cartItems.map((item) => [orderId, item.item_id]);
    await db.query('INSERT INTO order_items (order_id, item_id) VALUES ?', [values]);

    await db.query('TRUNCATE TABLE cart'); // Clear the cart after placing the order
    res.status(201).send('Order placed successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error placing order');
  }
});

// Fetch all orders (Admin)
app.get('/orders', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching orders');
  }
});

// Update order status (Admin)
app.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.status(200).send('Order status updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating order status');
  }
});

// Fetch a specific order status
app.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching order status');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



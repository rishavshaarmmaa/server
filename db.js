const mysql = require('mysql2/promise');

// Configure database connection
const db = mysql.createPool({
  host: 'localhost',     // Replace with your database host
  user: 'root',          // Replace with your MySQL username
  password: 'Br01pb5137@',  // Replace with your MySQL password
  database: 'restaurant_db',  // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,   // Maximum number of simultaneous connections
  queueLimit: 0,         // No limit for the queue
});

// Test the database connection
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Database connected successfully!');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1); // Exit the application if the database connection fails
  }
})();

module.exports = db;



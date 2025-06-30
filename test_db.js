require('dotenv').config();
const mysql = require('mysql2/promise');

// Log the database credentials to verify they're being read correctly
console.log('Database Configuration:');
console.log('- Host:', process.env.DB_HOST);
console.log('- Port:', process.env.DB_PORT);
console.log('- Database:', process.env.DB_NAME);
console.log('- User:', process.env.DB_USER);
console.log('- Password:', process.env.DB_PASSWORD ? 'Set (not showing for security)' : 'Not set');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('Successfully connected to MySQL database!');
    await connection.end();
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    return false;
  }
}

testConnection(); 
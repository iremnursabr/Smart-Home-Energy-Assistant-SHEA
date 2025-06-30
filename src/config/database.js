const { Sequelize } = require('sequelize');
require('dotenv').config();

// If environment variables aren't available, use these defaults
const DB_NAME = process.env.DB_NAME || 'smart_energy';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

console.log('Database Configuration:');
console.log('- Host:', DB_HOST);
console.log('- Port:', DB_PORT);
console.log('- Database:', DB_NAME);
console.log('- User:', DB_USER);
console.log('- Password:', DB_PASSWORD ? 'Set (not showing for security)' : 'Not set');

const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 3,
      backoffBase: 1000,
      backoffExponent: 1.5
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Detaylı hata mesajı
    if (error.name === 'SequelizeConnectionError') {
      console.error('Connection Error Details:', {
        host: DB_HOST,
        port: DB_PORT,
        database: DB_NAME,
        user: DB_USER
      });
    }
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
}; 
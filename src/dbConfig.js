require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '', 
    database: process.env.DB_NAME || 'soccer_platform',

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
};

module.exports = dbConfig;
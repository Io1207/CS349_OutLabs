const { Pool } = require('pg');

// Use environment variables if available
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'expense_splitter',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password_here',
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected DB error', err);
    process.exit(1);
});

module.exports = pool;
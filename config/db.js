const { Pool } = require('pg');
const { databaseUrl } = require('./config');

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

const connectDB = async () => {
  const client = await pool.connect();
  console.log('PostgreSQL connected successfully');
  client.release();
};

module.exports = { pool, connectDB };

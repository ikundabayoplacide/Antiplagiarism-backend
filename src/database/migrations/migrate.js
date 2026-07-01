const fs = require('fs');
const path = require('path');
const { pool } = require('../../../config/db');

const runMigrations = async () => {
  const migrationsDir = __dirname;
  const files = ['001_init.sql', '002_add_phone_number.sql'];

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    console.log(`Migration ran: ${file}`);
  }

  console.log('Database migrations ran successfully');
};

module.exports = runMigrations;

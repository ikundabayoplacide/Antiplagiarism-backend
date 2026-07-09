const fs = require('fs');
const path = require('path');
const { pool } = require('../../../config/db');

const runMigrations = async () => {
  const migrationsDir = __dirname;
  const files = ['001_init.sql', '002_add_phone_number.sql', '003_lecturer_students.sql', '004_add_department.sql'];

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    console.log(`Migration ran: ${file}`);
  }

  console.log('Database migrations ran successfully');
};

module.exports = runMigrations;

if (require.main === module) {
  runMigrations().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
}

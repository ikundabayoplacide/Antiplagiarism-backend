require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
  logging: false,
});

const connectDB = async () => {
  await sequelize.authenticate();
  console.log('PostgreSQL connected successfully via Sequelize');
};

module.exports = { sequelize, connectDB };

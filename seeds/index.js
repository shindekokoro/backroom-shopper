require('dotenv').config();
const sequelize = require('../config/connection');
const mysql = require('mysql2/promise');

const seedCategories = require('./category-seeds');
const seedProducts = require('./product-seeds');
const seedTags = require('./tag-seeds');
const seedProductTags = require('./product-tag-seeds');

const seedAll = async () => {
  await sequelize.sync({ force: true });
  if (process.argv[2] && process.argv[2] === 'data') {
    console.log('\n----- DATABASE SYNCED -----\n');
    await seedCategories();
    console.log('\n----- CATEGORIES SEEDED -----\n');

    await seedProducts();
    console.log('\n----- PRODUCTS SEEDED -----\n');

    await seedTags();
    console.log('\n----- TAGS SEEDED -----\n');

    await seedProductTags();
    console.log('\n----- PRODUCT TAGS SEEDED -----\n');
  }

  process.exit(0);
};

// If JAWSDB assume DB already created and source, otherwise check if database exists.
if (process.env.JAWSDB_URL) {
  return seedAll();
} else {
  return mysql
    .createConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PW
    })
    .then((connection) => {
      connection
        .query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`)
        .then(() => {
          console.log('Database checked for existence.');
          return seedAll();
        });
    });
}

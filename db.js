// server/db.js

const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
    user: "esteban",
    password: "123456",
    host: "localhost",
    port: 5432,
    database: "acme_hr_db",
});

async function connect() {
  try {
    await client.connect();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database', error);
  }
}

async function createTables() {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY,
        product_id UUID REFERENCES products(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
      );
    `);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables', error);
  }
}

async function createProduct(name) {
  try {
    const result = await client.query('INSERT INTO products (id, name) VALUES (uuid_generate_v4(), $1) RETURNING *', [name]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating product', error);
  }
}

async function createUser(username, password) {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await client.query('INSERT INTO users (id, username, password_hash) VALUES (uuid_generate_v4(), $1, $2) RETURNING *', [username, passwordHash]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user', error);
  }
}

async function fetchUsers() {
  try {
    const result = await client.query('SELECT id, username FROM users');
    return result.rows;
  } catch (error) {
    console.error('Error fetching users', error);
  }
}

async function fetchProducts() {
  try {
    const result = await client.query('SELECT * FROM products');
    return result.rows;
  } catch (error) {
    console.error('Error fetching products', error);
  }
}

async function fetchFavorites(userId) {
  try {
    const result = await client.query('SELECT * FROM favorites WHERE user_id = $1', [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching favorites', error);
  }
}

async function createFavorite(userId, productId) {
  try {
    const result = await client.query('INSERT INTO favorites (id, user_id, product_id) VALUES (uuid_generate_v4(), $1, $2) RETURNING *', [userId, productId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating favorite', error);
  }
}

async function destroyFavorite(userId, favoriteId) {
  try {
    await client.query('DELETE FROM favorites WHERE user_id = $1 AND id = $2', [userId, favoriteId]);
    console.log('Favorite deleted successfully');
  } catch (error) {
    console.error('Error deleting favorite', error);
  }
}

module.exports = {
  client,
  connect,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  createFavorite,
  destroyFavorite,
};

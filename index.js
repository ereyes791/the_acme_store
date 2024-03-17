// server/index.js

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { connect, createTables, createProduct, createUser, fetchUsers, fetchProducts, fetchFavorites, createFavorite, destroyFavorite } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize database connection
connect()
  .then(() => createTables())
  .then(() => seedData()) // Call seedData function after tables are created
  .catch(err => console.error('Error initializing application', err));

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await fetchProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/users/:id/favorites', async (req, res) => {
  try {
    const userId = req.params.id;
    const favorites = await fetchFavorites(userId);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/users/:id/favorites', async (req, res) => {
  try {
    const userId = req.params.id;
    const { product_id } = req.body;
    const favorite = await createFavorite(userId, product_id);
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/users/:userId/favorites/:id', async (req, res) => {
  try {
    const userId = req.params.userId;
    const favoriteId = req.params.id;
    await destroyFavorite(userId, favoriteId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Error handling route
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
async function seedData() {
    try {
      // Create users
      const user1 = await createUser('user1', 'password1');
      const user2 = await createUser('user2', 'password2');
  
      // Create products
      const product1 = await createProduct('Product 1');
      const product2 = await createProduct('Product 2');
  
      // Create favorites
      const favorite1 = await createFavorite(user1.id, product1.id);
      const favorite2 = await createFavorite(user2.id, product2.id);
  
      console.log('Seed data inserted successfully');
    } catch (error) {
      console.error('Error seeding data', error);
    }
  }
  
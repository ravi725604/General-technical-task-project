const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  console.log('req.cookies', req.cookies);
  const token = req.cookies.token;
  console.log('token', token);
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(req.user);
    next();
  } catch (error) {
    res.status(400).send('Invalid token.');
  }
};

// User registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username || !password || !name) {
      return res.status(400).send('Username, password, and name are required');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, name });
    await user.save();
    res.status(201).send(`
      <p>You registered successfully</p>
      <button onclick="window.location.href='/login.html'">Go to Login Page</button>
    `);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid credentials');
    const token = jwt.sign({ userId: user._id, username: user.username, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set cookie without the httpOnly flag
    res.cookie('token', token, { path: '/', domain: 'localhost', secure: false });

    // Redirect to index.html
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Add liked property
router.post('/likedProperties', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).send('Property ID is required');
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).send('User not found');
    user.likedProperties.push(propertyId);
    await user.save();
    res.status(200).send('Property liked successfully');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Remove liked property
router.delete('/likedProperties', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).send('Property ID is required');
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).send('User not found');
    user.likedProperties = user.likedProperties.filter(id => id !== propertyId);
    await user.save();
    res.status(200).send('Property unliked successfully');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get user details if logged in
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); // Exclude password from the response
    if (!user) return res.status(404).send('User not found');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;

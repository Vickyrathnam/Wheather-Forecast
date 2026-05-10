// Auth Routes - JWT + OAuth
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Simple in-memory user store (replace with Prisma/DB in production)
const users = new Map();

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET || 'weather_jwt_secret_2024',
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'weather_refresh_secret_2024',
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    if (users.has(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const user = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      savedCities: [],
      preferences: { units: 'metric', theme: 'dark', notifications: true },
      createdAt: new Date().toISOString(),
    };
    users.set(email, user);
    const tokens = generateTokens(userId);
    res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      ...tokens,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const tokens = generateTokens(user.id);
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      ...tokens,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'weather_refresh_secret_2024');
    const tokens = generateTokens(payload.userId);
    res.json({ success: true, ...tokens });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
module.exports.users = users;

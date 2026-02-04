const result = require('dotenv').config();
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const riskRoutes = require('./routes/risks');
const actionRoutes = require('./routes/actions');
const pdfRoutes = require('./routes/pdf');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware (Manual CORS)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow Vercel and Localhost explicitly, or fallback to reflecting origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// app.use(helmet()); // Disabled for debugging
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint to check env vars in production (does not expose values)
app.get('/api/debug/env', (req, res) => {
  res.json({
    GROQ_API_KEY: process.env.GROQ_API_KEY ? 'Present' : 'Missing',
    DATABASE_URL: process.env.DATABASE_URL ? 'Present' : 'Missing',
    JWT_SECRET: process.env.JWT_SECRET ? 'Present' : 'Missing',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    PORT: process.env.PORT || 'not set'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 RIPD Manager API running on port ${PORT}`);
});

module.exports = app;

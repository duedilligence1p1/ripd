require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const riskRoutes = require('./routes/risks');
const actionRoutes = require('./routes/actions');
const pdfRoutes = require('./routes/pdf');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Allow any origin that sends credentials (effectively reflect-origin)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicitly handle pre-flight
app.options('*', cors());

app.use(helmet());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/pdf', pdfRoutes);

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

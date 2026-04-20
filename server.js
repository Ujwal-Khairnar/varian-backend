require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const { port, nodeEnv, corsOrigin } = require('./src/config/env');
const { errorHandler } = require('./src/middleware/error');

// Connect DB on startup
require('./src/config/db');

const app = express();

// ── Security & utility middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/v1', require('./src/routes/api/v1/index'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) =>
  res.json({ status: 'ok', env: nodeEnv, time: new Date().toISOString() })
);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
);

// ── Central error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀  Server running on http://localhost:${port} [${nodeEnv}]`);
});

module.exports = app;
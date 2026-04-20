require('dotenv').config();

module.exports = {
  port:         process.env.PORT          || 5000,
  nodeEnv:      process.env.NODE_ENV      || 'development',
  jwtSecret:    process.env.JWT_SECRET    || 'change_me_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN|| '7d',
  corsOrigin:   process.env.CORS_ORIGIN   || 'http://localhost:3000',
};
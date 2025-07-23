require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const log4js = require('log4js');

const initDb = require('./init-db');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Corrected log4js configuration: default console appender without layout
log4js.configure({
  appenders: {
    out: { type: 'stdout' }
  },
  categories: {
    default: { appenders: ['out'], level: 'info' }
  }
});
const logger = log4js.getLogger();

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(bodyParser.json());

// Inject logger into request for auth routes
app.use('/api', (req, res, next) => {
  req.logger = logger;
  next();
}, authRoutes);

// Initialize DB then start server
initDb()
  .then(() => {
    logger.info({ event: 'db_init', message: 'Database initialized successfully.' });
    app.listen(PORT, () => {
      logger.info({ event: 'server_start', message: `Backend listening at http://localhost:${PORT}` });
    });
  })
  .catch((err) => {
    logger.error({ event: 'db_init_error', message: 'Failed to initialize database', error: err });
    process.exit(1);
  });

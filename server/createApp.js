const express = require('express');
const cors = require('cors');
const imageRoutes = require('./api/routes/imageRoutes');
const authRoutes = require('./api/routes/authRoutes');
const createCatalogRouter = require('./api/routes/catalogRoutes');
const createCasualtyRouter = require('./api/routes/casualtyRoutes');
const errorHandler = require('./middlewares/errorHandler');

/** Builds the Express app from its dependencies (no I/O here, so tests can reuse it). */
function createApp({ casualtyService }) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static('uploads'));

  app.use('/api/images', imageRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/catalog', createCatalogRouter());
  app.use('/api/casualties', createCasualtyRouter(casualtyService));

  app.use(errorHandler);
  return app;
}

module.exports = createApp;

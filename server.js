const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerConfig');
const { port, nodeEnv } = require('./config/config');
const { connectDB, sequelize } = require('./config/database');
require('./src/database/modals/index'); // register models & associations

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const lecturerRoutes = require('./routes/lecturer');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');
const documentRoutes = require('./routes/document');

const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:8080', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/documents', documentRoutes);

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/', (req, res) => res.json({ message: 'Anti-Plagiarism API is running' }));

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'ok', database: 'connected', uptime: process.uptime() });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const { loadModel } = require('./src/embeddingService');

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: nodeEnv === 'development' });
    console.log('Database synced successfully');
    await loadModel();
    app.listen(port, () => {
      console.log(`Server running in ${nodeEnv} mode on port ${port}`);
      console.log(`Health check: http://localhost:${port}/`);
      console.log(`Swagger Docs: http://localhost:${port}/api/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

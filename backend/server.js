import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Load env vars BEFORE anything else
dotenv.config();

// Config & Utils
import env from './src/config/env.js';
import logger from './src/utils/logger.js';

// Middlewares
import { apiLimiter } from './src/middlewares/rateLimiter.js';
import requestLogger from './src/middlewares/requestLogger.js';
import errorHandler from './src/middlewares/errorHandler.js';

// Routes
import routes from './src/routes/index.js';

// Prisma (shared instance from config/db.js — imported by services)
import prisma from './src/config/db.js';

const app = express();
const PORT = env.PORT || 3000;

// ─── Global Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

// ─── Rate Limiting ───────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ─── Health Check ────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ success: true, message: 'System is healthy', database: 'connected' });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({ success: false, message: 'System degraded', database: 'disconnected' });
  }
});

// ─── API Routes (v1) ────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
    errorCode: 'NOT_FOUND',
  });
});

// ─── Global Error Handler (must be last) ─────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 CareSync Backend running on port ${PORT}`);
  logger.info(`📋 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;

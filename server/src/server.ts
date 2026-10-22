import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { envConfig } from './config/env';
import { requestLogger } from './middleware/logger';
import { apiRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health.router';
import { analyzeRouter } from './routes/analyze.router';
import { downloadRouter } from './routes/download.router';

export const app = express();

// 1. Security & Parsing Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      // Allow wildcard or development mode
      if (
        envConfig.allowedOrigins.includes('*') ||
        envConfig.nodeEnv === 'development' ||
        envConfig.allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      // Allow all origins by reflecting the origin back
      return callback(null, true);
    },
    credentials: true,
  })
);
app.options('*', cors());
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// 2. Rate Limiting for API routes
app.use('/api', apiRateLimiter);

// 3. API Routers
app.use('/api', healthRouter);
app.use('/api', analyzeRouter);
app.use('/api', downloadRouter);

// 4. Error Handling Middleware
app.use(errorHandler);

process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason);
});

// 5. Start Server if executed directly
if (require.main === module) {
  app.listen(envConfig.port, () => {
    console.log(`[Server] OmniDownloader Backend active at http://localhost:${envConfig.port}`);
  });
}

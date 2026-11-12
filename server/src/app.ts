import type {} from './types/express';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './db/models';
import passport from './config/passport';
import { config } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import productsRoutes from './modules/products/products.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import ordersRoutes from './modules/orders/orders.routes';
import adminRoutes from './modules/admin/admin.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration: explicit origin & credentials support
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

// Body and Cookie Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Feature Modules
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Unmatched route handler (404)
app.use(notFound);

// Global Error Handler (4 arguments)
app.use(errorHandler);

export { app };
export default app;

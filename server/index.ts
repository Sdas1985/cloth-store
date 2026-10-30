import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products';
import categoriesRouter from './routes/categories';
import ordersRouter from './routes/orders';
import deliveryRouter from './routes/delivery';
import settingsRouter from './routes/settings';
import adminRouter from './routes/admin';
import { initStore } from './storeRepo';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(
  cors({
    origin: true, // Allow frontend dev server and production domains
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  if (!req.url.startsWith('/api/health')) {
    console.log(`[Express API] ${req.method} ${req.url}`);
  }
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Roxy Cloth Store - Express.js API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);

// Start server
async function startServer() {
  await initStore();
  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Roxy Cloth Store - Express Backend running on:`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });

  return server;
}

// Only start directly if not imported as a module
if (require.main === module || !process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start Express server:', err);
  });
}

export default app;

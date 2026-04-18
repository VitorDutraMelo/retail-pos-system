import 'dotenv/config'; // 🔥 ESSENCIAL

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import saleRoutes from './routes/sale.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/sales', saleRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

// Debug (pode remover depois)
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
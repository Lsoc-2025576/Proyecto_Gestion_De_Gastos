import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { testDbConnection } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import { authenticateToken } from './middlewares/auth.middleware.js';
import { errorHandler, NotFoundError } from './middlewares/error-handler.middleware.js';
import incomeRoutes from './routes/income.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true, // Necesario para que las cookies viajen entre frontend y backend
}));

app.use(cookieParser());   
app.use(express.json()); 


app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Modulo de autenticacion
app.use('/api/auth', authRoutes);

app.use('/api/incomes', incomeRoutes);

// Ejemplo de ruta protegida
app.get('/api/protected-route', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Tienes acceso a esta ruta protegida con JWT!',
  });
});


app.use((req, res, next) => {
  next(new NotFoundError(`Ruta ${req.method} ${req.path} no encontrada`));
});


app.use(errorHandler);


testDbConnection();


const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});


process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

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

// ─── MIDDLEWARES GLOBALES ─────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true, // Necesario para que las cookies viajen entre frontend y backend
}));

app.use(cookieParser());   // Parsea cookies y las pone en req.cookies
app.use(express.json());   // Parsea JSON del body y lo pone en req.body

// ─── RUTAS ────────────────────────────────────────────────────

// Health check: util para monitoreo (Docker, PM2, etc.)
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

// Ejemplo de ruta protegida (puedes eliminarla si no la usas)
app.get('/api/protected-route', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Tienes acceso a esta ruta protegida con JWT!',
  });
});

// ─── 404 HANDLER ──────────────────────────────────────────────
// Si llegamos aqui, ninguna ruta coincidio con la URL solicitada
app.use((req, res, next) => {
  next(new NotFoundError(`Ruta ${req.method} ${req.path} no encontrada`));
});

// ─── ERROR HANDLER GLOBAL ─────────────────────────────────────
// SIEMPRE va al final de todo. Atrapa errores de TODOS los controllers y middlewares.
// Antes tenias try/catch en cada controller. Ahora puedes lanzar errores libremente
// y este middleware los atrapa, formatea y responde con JSON consistente.
app.use(errorHandler);

// ─── CONEXION A BASE DE DATOS ────────────────────────────────
testDbConnection();

// ─── ARRANQUE DEL SERVIDOR ────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});

// ─── GRACEFUL SHUTDOWN ────────────────────────────────────────
// Cuando el proceso recibe SIGTERM (ej: Docker stop, PM2 restart),
// cierra las conexiones limpiamente en vez de cortarlas abruptamente.
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

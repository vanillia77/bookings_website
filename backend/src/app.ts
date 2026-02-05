import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import statsRoutes from './routes/stats.routes';
import authRoutes from './routes/auth.routes';

const app: Application = express();

app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes


import bookingsRoutes from './routes/bookings.routes';

app.use('/api', authRoutes); // Auth routes at /api/login, etc.
app.use('/api/bookings', bookingsRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Backend is running TS ✅' });
});

export default app;


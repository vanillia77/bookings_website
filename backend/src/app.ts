import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import statsRoutes from './routes/stats.routes';
import authRoutes from './routes/auth.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes); // Auth routes at /api/login, etc.
app.use('/api/stats', statsRoutes);

app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Backend is running TS ✅' });
});

export default app;


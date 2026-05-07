import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { startAutomationWorker } from './services/automationWorker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(globalLimiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/campaigns', campaignRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Insta CommentBot API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startAutomationWorker();
});

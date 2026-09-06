import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import recordsRoutes from './routes/records';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main Router
const router = express.Router();
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/records', recordsRoutes);
router.use('/dashboard', dashboardRoutes);
app.use('/api', router);

// Serve the built frontend
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// For any route that isn't an API route, serve the frontend (supports client-side routing)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Error Handling block for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

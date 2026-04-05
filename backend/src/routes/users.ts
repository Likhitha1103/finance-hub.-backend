import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../db/index';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['Admin'])); // Only admins can manage users

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['Admin', 'Analyst', 'Viewer']),
});

const updateUserSchema = z.object({
  role: z.enum(['Admin', 'Analyst', 'Viewer']).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

// Get all users
router.get('/', (req: Request, res: Response) => {
  const users = db.prepare('SELECT id, email, role, status, created_at FROM users').all();
  res.json(users);
});

// Create user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = createUserSchema.parse(req.body);
    
    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
    const info = stmt.run(email, hashedPassword, role);

    res.status(201).json({ id: info.lastInsertRowid, email, role, status: 'Active' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user status or role
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const body = updateUserSchema.parse(req.body);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newRole = body.role || user.role;
    const newStatus = body.status || user.status;

    db.prepare('UPDATE users SET role = ?, status = ? WHERE id = ?').run(newRole, newStatus, userId);

    res.json({ message: 'User updated successfully', role: newRole, status: newStatus });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (soft delete by setting inactive, or hard delete)
router.delete('/:id', (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  // Instead of hard delete, let's mark as inactive so records aren't broken, or rely on ON DELETE SET NULL
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.json({ message: 'User deleted' });
});

export default router;

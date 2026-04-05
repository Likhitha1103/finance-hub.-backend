import { Router, Request, Response } from 'express';
import db from '../db/index';
import { z } from 'zod';
import { authenticateToken, requireRole, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);
// Analysts and Admins can view records
router.use(requireRole(['Admin', 'Analyst']));

const recordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  notes: z.string().optional()
});

// Get all records with optional filtering
router.get('/', (req: Request, res: Response) => {
  const { type, category, startDate, endDate } = req.query;
  
  let query = 'SELECT r.*, u.email as created_by_email FROM records r LEFT JOIN users u ON r.created_by = u.id WHERE 1=1';
  const params: any[] = [];

  if (type) {
    query += ' AND r.type = ?';
    params.push(type);
  }
  if (category) {
    query += ' AND r.category = ?';
    params.push(category);
  }
  if (startDate) {
    query += ' AND r.date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND r.date <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY r.date DESC, r.id DESC';

  const records = db.prepare(query).all(...params);
  res.json(records);
});

// Admin only: create, update, delete
router.post('/', requireRole(['Admin']), (req: AuthRequest, res: Response) => {
  try {
    const data = recordSchema.parse(req.body);
    const stmt = db.prepare(`
      INSERT INTO records (amount, type, category, date, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(data.amount, data.type, data.category, data.date, data.notes || null, req.user!.id);
    res.status(201).json({ id: info.lastInsertRowid, ...data });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', requireRole(['Admin']), (req: Request, res: Response) => {
  try {
    const recordId = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM records WHERE id = ?').get(recordId) as any;
    if (!existing) return res.status(404).json({ error: 'Record not found' });

    // Partial update
    const updated = { ...existing, ...req.body };
    const validated = recordSchema.parse(updated);

    const stmt = db.prepare(`
      UPDATE records SET amount = ?, type = ?, category = ?, date = ?, notes = ?
      WHERE id = ?
    `);
    stmt.run(validated.amount, validated.type, validated.category, validated.date, validated.notes || null, recordId);

    res.json({ id: recordId, ...validated });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireRole(['Admin']), (req: Request, res: Response) => {
  const recordId = Number(req.params.id);
  const info = db.prepare('DELETE FROM records WHERE id = ?').run(recordId);
  if (info.changes === 0) return res.status(404).json({ error: 'Record not found' });
  res.json({ message: 'Record deleted successfully' });
});

export default router;

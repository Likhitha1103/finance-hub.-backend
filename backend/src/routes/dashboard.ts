import { Router, Request, Response } from 'express';
import db from '../db/index';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken); // All authenticated roles can view the dashboard

router.get('/summary', (req: Request, res: Response) => {
  try {
    // Basic totals
    const incomeObj = db.prepare("SELECT SUM(amount) as total FROM records WHERE type = 'income'").get() as any;
    const expenseObj = db.prepare("SELECT SUM(amount) as total FROM records WHERE type = 'expense'").get() as any;

    const totalIncome = incomeObj.total || 0;
    const totalExpense = expenseObj.total || 0;
    const netBalance = totalIncome - totalExpense;

    // Category-wise totals
    const categoryTotals = db.prepare(`
      SELECT category, type, SUM(amount) as total 
      FROM records 
      GROUP BY category, type
      ORDER BY total DESC
    `).all();

    // Recent activity (latest 5 records)
    const recentActivity = db.prepare(`
      SELECT * FROM records ORDER BY date DESC, id DESC LIMIT 5
    `).all();

    // Monthly trends (group by YYYY-MM)
    const monthlyTrends = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total
      FROM records
      GROUP BY month, type
      ORDER BY month ASC
    `).all();

    res.json({
      totalIncome,
      totalExpense,
      netBalance,
      categoryTotals,
      recentActivity,
      monthlyTrends
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching summary' });
  }
});

export default router;

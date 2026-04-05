import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db/index';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_dev_only';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    status: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const stmt = db.prepare('SELECT id, email, role, status FROM users WHERE id = ?');
    const user = stmt.get(decoded.id) as any;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    req.user = user;
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires one of roles: ${roles.join(', ')}` });
    }
    next();
  };
};

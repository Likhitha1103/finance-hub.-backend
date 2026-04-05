import db from './index';
import bcrypt from 'bcrypt';
import { initializeSchema } from './schema';

const seed = async () => {
  initializeSchema();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count === 0) {
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const analystPassword = await bcrypt.hash('analyst123', saltRounds);
    const viewerPassword = await bcrypt.hash('viewer123', saltRounds);

    const insertUser = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
    
    insertUser.run('admin@example.com', adminPassword, 'Admin');
    insertUser.run('analyst@example.com', analystPassword, 'Analyst');
    insertUser.run('viewer@example.com', viewerPassword, 'Viewer');

    const adminId = 1;

    const insertRecord = db.prepare('INSERT INTO records (amount, type, category, date, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)');
    
    // Seed some financial records
    insertRecord.run(5000, 'income', 'Salary', '2026-04-01', 'Monthly salary', adminId);
    insertRecord.run(120, 'expense', 'Food', '2026-04-02', 'Groceries', adminId);
    insertRecord.run(50, 'expense', 'Transport', '2026-04-03', 'Bus and Train', adminId);
    insertRecord.run(1500, 'income', 'Freelance', '2026-04-04', 'Web development project', adminId);
    insertRecord.run(200, 'expense', 'Utilities', '2026-04-05', 'Electricity and Water', adminId);

    console.log('Database seeded with initial users and records!');
  } else {
    console.log('Database already seeded.');
  }
};

seed().catch(console.error);

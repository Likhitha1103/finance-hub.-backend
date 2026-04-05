import db from './index';

export const initializeSchema = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Viewer', -- 'Admin', 'Analyst', 'Viewer'
      status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Inactive'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      type TEXT NOT NULL, -- 'income' or 'expense'
      category TEXT NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
    );
  `);

  console.log('Database schema initialized.');
};

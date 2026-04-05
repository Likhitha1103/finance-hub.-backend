import Database from 'better-sqlite3';
import path from 'path';

// Using a file-based SQLite database
const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

db.pragma('journal_mode = WAL');

export default db;

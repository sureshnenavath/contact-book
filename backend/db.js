import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, 'contact.db.sqlite3');

try {
  const parent = dirname(dbPath);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }
} catch (err) {
  console.error('Failed to ensure DB directory exists for', dbPath, err);
}

let db;
try {
  db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error('Failed to open SQLite DB at', dbPath, err);
      console.error('Falling back to in-memory SQLite instance for development (data will not persist).');
      console.error('To fix file-backed DB, try:');
      console.error('  - Rebuild sqlite3 native bindings: cd backend && npm rebuild sqlite3 --build-from-source');
      console.error('  - Or install prebuilt bindings / ensure Node toolchain (Windows Build Tools) is available');
      try {
        db = new sqlite3.Database(':memory:');
      } catch (memErr) {
        console.error('Failed to create fallback in-memory SQLite DB', memErr);
        throw err;
      }
    }
  });
} catch (err) {
  console.error('Unexpected error while creating SQLite Database object for', dbPath, err);
  try {
    db = new sqlite3.Database(':memory:');
    console.error('In-memory DB started successfully');
  } catch (memErr) {
    console.error('Failed to create in-memory SQLite DB', memErr);
    throw err;
  }
}

const initializeDb = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const getContacts = (page = 1, limit = 10) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    
    
    db.get('SELECT COUNT(*) as total FROM contacts', (err, countResult) => {
      if (err) {
        reject(err);
        return;
      }
      
      
      db.all(
        'SELECT * FROM contacts ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset],
        (err, contacts) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              contacts,
              total: countResult.total,
              totalPages: Math.ceil(countResult.total / limit),
              currentPage: page
            });
          }
        }
      );
    });
  });
};

const addContact = (contact) => {
  return new Promise((resolve, reject) => {
    const { name, email, phone } = contact;
    db.run(
      'INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone],
      function(err) {
        if (err) {
          reject(err);
        } else {
          db.get(
            'SELECT * FROM contacts WHERE id = ?',
            [this.lastID],
            (err, contact) => {
              if (err) {
                reject(err);
              } else {
                resolve(contact);
              }
            }
          );
        }
      }
    );
  });
};

const deleteContact = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM contacts WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ deletedId: id, changes: this.changes });
      }
    });
  });
};

export { initializeDb, getContacts, addContact, deleteContact };
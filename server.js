const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 5500;

app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'hrm-data.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create tables if not exist
const createTables = () => {
    db.run(`CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        role TEXT,
        working_days TEXT,
        working_hours TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week TEXT,
        days TEXT,
        hours TEXT,
        status TEXT,
        submitted TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        check_in TEXT,
        check_out TEXT,
        hours TEXT,
        status TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
    )`);
};
createTables();

// Serve static frontend files only if not in API route
if (process.env.SERVE_FRONTEND !== 'false') {
  const staticPath = path.join(__dirname);
  app.use(express.static(staticPath));
}

// API endpoints
app.post('/api/settings', (req, res) => {
    const { name, email, role, working_days, working_hours } = req.body;
    db.run('DELETE FROM user_settings');
    db.run('INSERT INTO user_settings (name, email, role, working_days, working_hours) VALUES (?, ?, ?, ?, ?)',
        [name, email, role, working_days, working_hours],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.get('/api/settings', (req, res) => {
    db.get('SELECT * FROM user_settings LIMIT 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.post('/api/availability', (req, res) => {
    const { week, days, hours, status, submitted } = req.body;
    db.run('INSERT INTO availability (week, days, hours, status, submitted) VALUES (?, ?, ?, ?, ?)',
        [week, days, hours, status, submitted],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.get('/api/availability', (req, res) => {
    db.all('SELECT * FROM availability ORDER BY id DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/attendance', (req, res) => {
    const { date, check_in, check_out, hours, status } = req.body;
    db.run('INSERT INTO attendance (date, check_in, check_out, hours, status) VALUES (?, ?, ?, ?, ?)',
        [date, check_in, check_out, hours, status],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.get('/api/attendance', (req, res) => {
    db.all('SELECT * FROM attendance ORDER BY id DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Reset attendance history
app.post('/api/attendance/reset', (req, res) => {
    db.run('DELETE FROM attendance', function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Add authentication endpoints
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: 'Email already exists or invalid data.' });
        res.json({ success: true, userId: this.lastID });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, hashedPassword], (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Invalid credentials.' });
        res.json({ success: true, user });
    });
});

// Add endpoint to delete a single attendance record
app.post('/api/attendance/delete', (req, res) => {
    const { id } = req.body;
    db.run('DELETE FROM attendance WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Add endpoint to delete a single availability record
app.post('/api/availability/delete', (req, res) => {
    const { id } = req.body;
    db.run('DELETE FROM availability WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

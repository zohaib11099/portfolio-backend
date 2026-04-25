require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection (Aiven Cloud Connection)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
});

// --- API Endpoints ---

// 1. Save User from Preloader
app.post('/api/init-visitor', async (req, res) => {
    const { name } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO visitors (name) VALUES (?)', [name]);
        res.json({ success: true, message: 'Visitor registered', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error });
    }
});

// 2. Submit Contact Form
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await pool.query('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error });
    }
});

// 3. Save Game Score
app.post('/api/score', async (req, res) => {
    const { visitor_name, score } = req.body;
    try {
        await pool.query('INSERT INTO game_scores (visitor_name, score) VALUES (?, ?)', [visitor_name, score]);
        res.json({ success: true, message: 'Score saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error });
    }
});

// 4. Get Top 5 Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT visitor_name, score FROM game_scores ORDER BY score DESC LIMIT 5');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error });
    }
});

// 🔥 Vercel Deployment Fix:
// Local par port 5000 par chalega, Vercel par automatically manage hoga
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Vercel ke liye exports zaroori hai
module.exports = app;
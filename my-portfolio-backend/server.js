require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
// Database Connection (Updated for Aiven Cloud)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // 🔥 Naya Port Add kiya
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false } // 🔥 AIVEN KE LIYE YEH SAB SE ZAROORI HAI
});
// API Endpoint: Save User from Preloader
app.post('/api/init-visitor', async (req, res) => {
    const { name } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO visitors (name) VALUES (?)', [name]);
        res.json({ success: true, message: 'Visitor registered', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error });
    }
});

// API Endpoint: Submit Contact Form
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await pool.query('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// API Endpoint: Save Game Score
app.post('/api/score', async (req, res) => {
    const { visitor_name, score } = req.body;
    try {
        await pool.query('INSERT INTO game_scores (visitor_name, score) VALUES (?, ?)', [visitor_name, score]);
        res.json({ success: true, message: 'Score saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error });
    }
});

// API Endpoint: Get Top 5 Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        // Sirf top 5 highest scores fetch karega, highest first (DESC)
        const [rows] = await pool.query('SELECT visitor_name, score FROM game_scores ORDER BY score DESC LIMIT 5');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error });
    }
});
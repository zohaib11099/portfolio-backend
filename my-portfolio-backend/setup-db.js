require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTables() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });

        console.log("Connecting to Aiven Cloud...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS visitors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Visitors table created!");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Contacts table created!");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS game_scores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                visitor_name VARCHAR(255) NOT NULL,
                score INT NOT NULL,
                played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Game Scores table created!");

        console.log("🎉 All tables are ready on Cloud!");
        process.exit();
    } catch (error) {
        console.error("❌ Error creating tables:", error);
    }
}

createTables();
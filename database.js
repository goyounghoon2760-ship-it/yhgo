const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'futureparty.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize tables
        db.serialize(() => {
            // News Table
            db.run(`CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                date TEXT NOT NULL
            )`);
            
            // Inquiries Table
            db.run(`CREATE TABLE IF NOT EXISTS inquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                message TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Seed initial news data if empty
            db.get("SELECT COUNT(*) AS count FROM news", (err, row) => {
                if (row.count === 0) {
                    const stmt = db.prepare("INSERT INTO news (title, date) VALUES (?, ?)");
                    stmt.run("미래정당 제 1차 전국 당원 대회 개최 안내", "2026-04-22");
                    stmt.run("국민 주거 안정화를 위한 부동산 정책 특별 발표", "2026-04-21");
                    stmt.run("홍길동 대표, 지역구 민생 탐방 완료", "2026-04-20");
                    stmt.finalize();
                    console.log("Seeded initial news data.");
                }
            });
        });
    }
});

module.exports = db;

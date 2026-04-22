const path = require('path');

let db;

if (process.env.VERCEL) {
    // Vercel Serverless 환경에서는 SQLite Native 모듈 충돌을 막기 위해 가짜(Mock) DB를 사용합니다.
    console.log("Vercel 환경 감지: 임시 메모리 DB 모드로 작동합니다.");
    db = {
        all: (query, params, cb) => {
            cb(null, [
                { id: 3, title: "이재명 대통령, 2026년도 예산안 728조원 확정…AI·R&D 분야 집중 투자", date: "2026. 04. 22" },
                { id: 2, title: "민생회복 소비쿠폰, 전 국민 지급 완료", date: "2026. 04. 20" },
                { id: 1, title: "한미 정상회담 개최…동맹 강화 및 경제협력 논의", date: "2026. 04. 18" }
            ]);
        },
        run: (query, params, cb) => {
            const callback = typeof cb === 'function' ? cb : (typeof params === 'function' ? params : () => {});
            callback(null);
        },
        serialize: (cb) => {
            if (cb) cb();
        }
    };
} else {
    // 로컬 환경에서는 정상적으로 SQLite3를 사용합니다.
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, 'futureparty.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error connecting to database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            date TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.get("SELECT COUNT(*) as count FROM news", (err, row) => {
            if (!err && row.count === 0) {
                const stmt = db.prepare("INSERT INTO news (title, content, date) VALUES (?, ?, ?)");
                stmt.run("이재명 대통령, 2026년도 예산안 728조원 확정…AI·R&D 분야 집중 투자", "내용 없음", "2026. 04. 22");
                stmt.run("민생회복 소비쿠폰, 전 국민 지급 완료", "내용 없음", "2026. 04. 20");
                stmt.run("한미 정상회담 개최…동맹 강화 및 경제협력 논의", "내용 없음", "2026. 04. 18");
                stmt.finalize();
                console.log("Seeded initial news data.");
            }
        });
    });
}

module.exports = db;

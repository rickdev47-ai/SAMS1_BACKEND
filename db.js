const mysql = require("mysql2");

const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect(err => {
    if (err) {
        console.error("❌ MySQL connection failed:", err);
    } else {
        console.log("✅ MySQL connected (Railway)");
    }
});

module.exports = db;


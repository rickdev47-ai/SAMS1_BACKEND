const mysql = require("mysql2");

const db = mysql.createPool(process.env.DATABASE_URL);

db.getConnection((err) => {
    if (err) {
        console.error("❌ MySQL connection failed:", err);
    } else {
        console.log("✅ MySQL connected (ONLINE)");
    }
});

module.exports = db;



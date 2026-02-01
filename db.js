const mysql = require("mysql2");

// create connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Rick@0305", // 🔴 put your MySQL password
    database: "sams_db"
});

// connect to MySQL
db.connect(err => {
    if (err) {
        console.error("❌ MySQL connection failed:", err.message);
        return;
    }
    console.log("✅ MySQL Connected");
});

module.exports = db;

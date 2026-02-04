const mysql = require("mysql2");

<<<<<<< HEAD
const db = mysql.createPool(process.env.DATABASE_URL);

db.getConnection((err) => {
    if (err) {
        console.error("❌ MySQL connection failed:", err);
    } else {
        console.log("✅ MySQL connected (ONLINE)");
=======
const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect(err => {
    if (err) {
        console.error("❌ MySQL connection failed:", err);
    } else {
        console.log("✅ MySQL connected (Railway)");
>>>>>>> 86c99fa6ebe492fc637fd3e1d4dc914af042c85b
    }
});

module.exports = db;


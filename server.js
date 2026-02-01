const express = require("express");
const cors = require("cors");
const db = require("./db");   // mysql connection file

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/* ================= TEST ================= */

app.get("/", (req, res) => {
    res.send("SAMS Backend is running");
});

/* ================= LOGIN ================= */

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "admin123") {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});


/* ================= STUDENTS (MYSQL) ================= */

// ADD STUDENT
app.post("/students", (req, res) => {
    const { roll, name, className } = req.body;

    if (!roll || !name || !className) {
        return res.status(400).json({
            success: false,
            message: "All fields required"
        });
    }

    const sql = "INSERT INTO students (roll, name, class) VALUES (?, ?, ?)";

    db.query(sql, [roll, name, className], (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.json({
                    success: false,
                    message: "Roll already exists"
                });
            }
            console.error(err);
            return res.status(500).json({ success: false });
        }

        res.json({ success: true });
    });
});

// GET ALL STUDENTS
app.get("/students", (req, res) => {
    db.query("SELECT * FROM students", (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json([]);
        }
        res.json(results);
    });
});

// DELETE STUDENT
app.delete("/students/:roll", (req, res) => {
    const roll = req.params.roll;

    db.query(
        "DELETE FROM students WHERE roll = ?",
        [roll],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found"
                });
            }

            res.json({ success: true });
        }
    );
});

// UPDATE STUDENT
app.put("/students/:roll", (req, res) => {
    const { name, className } = req.body;
    const roll = req.params.roll;

    if (!name || !className) {
        return res.status(400).json({
            success: false,
            message: "All fields required"
        });
    }

    const sql = "UPDATE students SET name = ?, class = ? WHERE roll = ?";

    db.query(sql, [name, className, roll], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({ success: true });
    });
});

/* ================= ATTENDANCE (MYSQL) ================= */

app.post("/attendance", (req, res) => {
    const { date, className, records } = req.body;

    if (!date || !className || !records || records.length === 0) {
        return res.status(400).json({ success: false });
    }

    // delete old attendance for same date & class
    const deleteSql = `
        DELETE FROM attendance 
        WHERE date = ? AND class = ?
    `;

    db.query(deleteSql, [date, className], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }

        const insertSql = `
            INSERT INTO attendance (student_roll, date, status, class)
            VALUES ?
        `;

        const values = records.map(r => [
            r.roll,
            date,
            r.status,
            className
        ]);

        db.query(insertSql, [values], (err2) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ success: false });
            }

            res.json({ success: true });
        });
    });
});

/* ================= REPORT (MYSQL JOIN) ================= */

/* ================= REPORT (MYSQL) ================= */

app.get("/report", (req, res) => {
    const { className } = req.query;

    let sql = `
        SELECT 
            s.roll,
            s.name,
            COUNT(a.id) AS total,
            SUM(a.status = 'Present') AS present
        FROM attendance a
        INNER JOIN students s 
            ON TRIM(a.student_roll) = TRIM(s.roll)
    `;

    const params = [];

    if (className && className !== "All Classes") {
        sql += " WHERE a.class = ?";
        params.push(className);
    }

    sql += " GROUP BY s.roll, s.name";

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json([]);
        }

        const final = results.map(r => ({
            roll: r.roll,
            name: r.name,
            total: r.total,
            present: r.present,
            percentage: ((r.present / r.total) * 100).toFixed(2)
        }));

        res.json(final);
    });
});


/* ================= START SERVER ================= */

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

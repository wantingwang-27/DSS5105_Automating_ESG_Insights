const fs = require('fs');
const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3001;

// Setup logs
const logDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFilename = `server-${timestamp}.log`;
const logStream = fs.createWriteStream(path.join(logDir, logFilename), { flags: 'a' });

// Enhanced logging
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
console.log = (...args) => {
    originalConsoleLog(...args);
    logStream.write(`[LOG] ${new Date().toISOString()} ${args.join(' ')}\n`);
};
console.error = (...args) => {
    originalConsoleError(...args);
    logStream.write(`[ERROR] ${new Date().toISOString()} ${args.join(' ')}\n`);
};

// Middleware
app.use(cors());
app.use(express.json());

// DB connection
const db = new sqlite3.Database('esg.db');

// Create table if it doesn't exist (now includes GPT insights!)
db.run(`
    CREATE TABLE IF NOT EXISTS esg_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT,
        e INTEGER,
        s INTEGER,
        g INTEGER,
        overall INTEGER,
        extracted REAL,
        predicted REAL,
        grade TEXT,
        gpt_environmental_insight TEXT,
        gpt_social_insight TEXT,
        gpt_governance_insight TEXT,
        gpt_overall_score INTEGER
    )
`);

// 📥 POST: Insert ESG scores and GPT insights
app.post('/api/esg', (req, res) => {
    console.log("📥 Incoming POST body:", req.body);

    const {
        company,
        e, s, g,
        overall,
        extracted,
        predicted,
        grade,
        gpt_environmental_insight,
        gpt_social_insight,
        gpt_governance_insight,
        gpt_overall_score
    } = req.body;

    db.run(
        `INSERT INTO esg_scores (
            company, e, s, g, overall, extracted, predicted, grade,
            gpt_environmental_insight, gpt_social_insight, gpt_governance_insight, gpt_overall_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            company, e, s, g, overall, extracted, predicted, grade,
            gpt_environmental_insight, gpt_social_insight, gpt_governance_insight, gpt_overall_score
        ],
        function (err) {
            if (err) {
                console.error("❌ Insert error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.status(200).json({ id: this.lastID });
        }
    );
});

// 📄 GET: Return all ESG data (including GPT insights)
app.get('/api/esg', (req, res) => {
    db.all(
        `SELECT id, company, e, s, g, overall, extracted, predicted, grade,
                gpt_environmental_insight, gpt_social_insight, gpt_governance_insight, gpt_overall_score
         FROM esg_scores`,
        [],
        (err, rows) => {
            if (err) {
                console.error("❌ Fetch error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.json(rows);
        }
    );
});

// 🧹 DELETE: Clear all ESG data
app.delete('/api/esg', (req, res) => {
    db.run("DELETE FROM esg_scores", [], (err) => {
        if (err) {
            console.error("❌ Delete error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        console.log("🧹 All ESG data cleared.");
        res.json({ message: "All ESG data cleared." });
    });
});

// ✏️ PATCH: Update company name
app.patch('/api/esg/:id', (req, res) => {
    const { id } = req.params;
    const { company } = req.body;

    db.run(
        "UPDATE esg_scores SET company = ? WHERE id = ?",
        [company, id],
        function (err) {
            if (err) {
                console.error("❌ Update error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            console.log(`✏️ Company updated for ID ${id} → ${company}`);
            res.json({ message: "✅ Company name updated." });
        }
    );
});

// 🚀 Start server
app.listen(PORT, () => {
    console.log(`✅ ESG API running at http://localhost:${PORT}`);
});

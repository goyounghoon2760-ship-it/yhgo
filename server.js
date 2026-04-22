const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// 1. Home (Web -> WAS -> DB)
app.get('/', (req, res) => {
    // Fetch news from DB
    db.all("SELECT * FROM news ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        res.render('index', { news: rows });
    });
});

// 2. Submit Inquiry (Web -> WAS -> DB)
app.post('/api/inquiry', (req, res) => {
    const { name, email, message } = req.body;
    db.run("INSERT INTO inquiries (name, email, message) VALUES (?, ?, ?)", [name, email, message], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).send("Error submitting inquiry.");
        }
        // Redirect back to home
        res.redirect('/#contact');
    });
});

app.listen(PORT, () => {
    console.log(`WAS (Server) is running on http://localhost:${PORT}`);
});

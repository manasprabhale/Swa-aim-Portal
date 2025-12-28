require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(express.json());
app.use(cors());

// 2. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.log("❌ DB Connection Error:", err.message));

// 3. Serve Static Files
// This serves your index.html, CSS, etc., from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// 4. Registration API Route
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: "Investor registered successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 5. THE FIX: New Syntax for Wildcard Route
// This catches all other routes and sends them to your index.html
app.get('/:any*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Swa-aim Server running on port ${PORT}`);
});

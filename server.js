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

// 2. SERVE YOUR FRONTEND FILES
// This line tells the server to show files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// 3. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err.message));

// 4. API Routes
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

// 5. Serve index.html for the main route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server is live at port ${PORT}`);
});

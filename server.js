require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Serve the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ DB Error:", err));

// API: Register
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "Registration Successful" });
    } catch (err) {
        res.status(400).json({ error: "Email already registered" });
    }
});

// API: Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) res.json(user);
    else res.status(401).json({ error: "Invalid credentials" });
});

// API: Add Policy
app.post('/api/add-policy', async (req, res) => {
    try {
        const { email, policyNumber, dob, premium, mode } = req.body;
        const user = await User.findOne({ email });
        user.policies.push({ policyNumber, dob, premium, mode });
        await user.save();
        res.json(user.policies);
    } catch (err) {
        res.status(500).json({ error: "Failed to add policy" });
    }
});

// Fallback to index.html for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

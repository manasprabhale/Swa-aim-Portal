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
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// Registration
app.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const newUser = new User({ name, email, phone, password });
        await newUser.save();
        res.status(201).json({ message: "Account Created!" });
    } catch (err) {
        res.status(400).json({ error: "Email already exists" });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Add Policy Route
app.post('/add-policy', async (req, res) => {
    try {
        const { email, policyNumber, dob, premium, mode } = req.body;
        const user = await User.findOne({ email });
        user.policies.push({ policyNumber, dob, premium, mode });
        await user.save();
        res.json({ message: "Policy Added!", policies: user.policies });
    } catch (err) {
        res.status(500).json({ error: "Error adding policy" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Port: ${PORT}`));

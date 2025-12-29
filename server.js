require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// --- THE FIX ---
// This tells Express to look for your HTML, CSS, and JS inside the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 10000;

// Database Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    policies: [{
        policyNumber: String,
        dob: String,
        premium: Number,
        mode: String
    }]
});
const User = mongoose.model('User', userSchema);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// API Routes
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "Registration successful!" });
    } catch (err) { res.status(400).json({ error: "Email already exists" }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email, password: req.body.password });
        if (user) res.json(user);
        else res.status(401).json({ error: "Invalid credentials" });
    } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

app.post('/api/add-policy', async (req, res) => {
    try {
        const { email, policyNumber, dob, premium, mode } = req.body;
        const user = await User.findOne({ email });
        user.policies.push({ policyNumber, dob, premium, mode });
        await user.save();
        res.json(user.policies);
    } catch (e) { res.status(500).json({ error: "Failed to add policy" }); }
});

// --- THE FIX FOR "NOT FOUND" ---
// If the user visits any URL, send them the index.html from the 'public' folder
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

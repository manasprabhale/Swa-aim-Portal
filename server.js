require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// SERVE STATIC FILES: This allows Render to find your HTML/JS/CSS
app.use(express.static(path.join(__dirname, '/')));

const PORT = process.env.PORT || 5000;

// User & Policy Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    policies: [{
        policyNumber: String,
        dob: String,
        premium: Number,
        mode: String,
        status: { type: String, default: 'Active' }
    }]
});
const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// API: Register
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "Registration successful!" });
    } catch (err) { res.status(400).json({ error: "Email already exists" }); }
});

// API: Login
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    if (user) res.json(user);
    else res.status(401).json({ error: "Invalid credentials" });
});

// API: Add Policy (Handles Multiple Policies)
app.post('/api/add-policy', async (req, res) => {
    try {
        const { email, policyNumber, dob, premium, mode } = req.body;
        const user = await User.findOne({ email });
        user.policies.push({ policyNumber, dob, premium, mode });
        await user.save();
        res.json(user.policies);
    } catch (e) { res.status(500).json({ error: "Failed to add policy" }); }
});

// Serve index.html for the main route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

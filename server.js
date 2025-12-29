require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// SERVE FRONTEND: This tells Node to look in the current folder for your HTML/CSS/JS
app.use(express.static(path.join(__dirname, '/')));

const PORT = process.env.PORT || 5000;

// Database Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
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

// Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// API: Register
app.post('/api/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: 'Account created successfully' });
    } catch (e) { res.status(400).json({ error: "Email already exists" }); }
});

// API: Login
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    if (user) res.json(user);
    else res.status(401).json({ error: 'Invalid email or password' });
});

// API: Add Policy
app.post('/api/add-policy', async (req, res) => {
    try {
        const { email, policyNumber, dob, premium, mode } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        user.policies.push({ policyNumber, dob, premium, mode });
        await user.save();
        res.json(user.policies);
    } catch (e) { res.status(500).json({ error: "Failed to add policy" }); }
});

// Route for the Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

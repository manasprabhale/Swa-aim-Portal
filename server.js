require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

// --- FIX: This serves your HTML/CSS/JS files to the browser ---
app.use(express.static(path.join(__dirname, '/')));

const PORT = process.env.PORT || 5000;

// Schema with your requested fields
const customerSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: { type: String },
    policies: [{
        policyNumber: String,
        dob: String,
        premium: Number,
        mode: String, // Monthly, Yearly, etc.
        status: { type: String, default: 'Active' }
    }]
});
const Customer = mongoose.model('Customer', customerSchema);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ Connection Error:", err));

// API: Login
app.post('/api/login', async (req, res) => {
    const user = await Customer.findOne({ email: req.body.email });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        res.json(user);
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// API: Add Policy (The logic for your button)
app.post('/api/add-policy', async (req, res) => {
    try {
        const { email, policyNumber, dob, premium, mode } = req.body;
        const user = await Customer.findOne({ email });
        user.policies.push({ policyNumber, dob, premium, mode });
        await user.save();
        res.json(user.policies);
    } catch (e) { res.status(500).json({ error: "Failed to add policy" }); }
});

// --- FIX: Redirects all website visits to your index.html ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

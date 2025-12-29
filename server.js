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

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// Register API
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "Success" });
    } catch (err) { res.status(400).json({ error: "Email exists" }); }
});

// Login API
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    if (user) res.json(user);
    else res.status(401).json({ error: "Invalid login" });
});

// Add Policy API
app.post('/api/add-policy', async (req, res) => {
    try {
        const { email, policyNumber, dob, premium, mode } = req.body;
        const user = await User.findOne({ email });
        user.policies.push({ policyNumber, dob, premium, mode });
        await user.save();
        res.json(user.policies);
    } catch (err) { res.status(500).json({ error: "Failed" }); }
});

// Redirect all other requests to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

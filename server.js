require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve Static Files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.log("❌ DB Connection Error:", err.message));

// --- API ROUTES ---

// Registration Route
app.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: "Email already registered" });

        const newUser = new User({ name, email, phone, password });
        await newUser.save();
        res.status(201).json({ message: "Account created successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || user.password !== password) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        
        res.status(200).json({ 
            message: "Login successful!", 
            user: { name: user.name, email: user.email, balance: user.totalInvestment } 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
// --- Route to Add a New Policy ---
app.post('/add-policy', async (req, res) => {
    try {
        const { email, policyNumber, dob, premium, paymentMode } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Add the new policy to the user's policies array
        user.policies.push({ policyNumber, dob, premium, paymentMode });
        await user.save();

        res.status(200).json({ message: "Policy added successfully!", policies: user.policies });
    } catch (err) {
        res.status(500).json({ error: "Failed to add policy" });
    }
});
// Serve the main page - Optimized for Node 22
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Swa-aim Server live on port ${PORT}`));


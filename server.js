require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT authentication
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 10000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// API: Register
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, ...otherFields } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ email, password: hashedPassword, ...otherFields });
        await newUser.save();
        res.status(201).json({ message: "Account Created Successfully!" });
    } catch (err) {
        if (err.code === 11000) { // Duplicate key error
            res.status(400).json({ error: "Email already exists" });
        } else {
            res.status(500).json({ error: "Registration failed" });
        }
    }
});

// API: Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid email or password" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: "Invalid email or password" });

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.json({ token, user: userWithoutPassword });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// API: Get Policies (Protected route)
app.get('/api/policies', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.policies);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch policies" });
    }
});

// API: Add Policy (Protected route)
app.post('/api/add-policy', authenticateToken, async (req, res) => {
    try {
        const { policyNumber, dob, premium, mode } = req.body;
        if (!policyNumber || !dob || !premium || !mode) {
            return res.status(400).json({ error: 'All policy fields are required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.policies.push({ policyNumber, dob, premium, mode });
        await user.save();
        res.json(user.policies);
    } catch (e) {
        res.status(500).json({ error: "Failed to save policy" });
    }
});

// Catch-all for SPA: Serve index.html for any non-API route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

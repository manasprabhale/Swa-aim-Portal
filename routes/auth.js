const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Policy = require('../models/Policy');

// 1. Register User
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, phone, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// 2. Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        res.json({
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// 3. Get User Policies
router.get('/policies/:userId', async (req, res) => {
    try {
        const policies = await Policy.find({ userId: req.params.userId });
        res.json(policies);
    } catch (err) {
        res.status(500).json({ message: "Error fetching policies" });
    }
});

// 4. Create a "Welcome" Policy (Admin Helper)
router.post('/policies/seed', async (req, res) => {
    try {
        const { userId } = req.body;
        const newPolicy = new Policy({
            userId: userId,
            planName: "Standard Life Plan",
            amount: 5000,
            description: "Your introductory investment plan.",
            status: "Active"
        });
        await newPolicy.save();
        res.json({ message: "Welcome policy created!" });
    } catch (err) {
        res.status(500).json({ message: "Error seeding policy" });
    }
});

module.exports = router;

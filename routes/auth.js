const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Policy = require('../models/Policy');

// 1. Register with Email Notification Placeholder
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, phone, password });
        await user.save();
        
        // EMAIL NOTIFICATION LOGIC
        console.log(`📧 Notification: Welcome email sent to ${email}`);
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 2. Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        res.json({
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 3. Profile Editing
router.put('/profile/:userId', async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId, 
            { name, phone }, 
            { new: true }
        );
        res.json({ message: "Profile updated!", user });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

// 4. Get Policies with Search/Filter
router.get('/policies/:userId', async (req, res) => {
    try {
        const { search } = req.query;
        let query = { userId: req.params.userId };

        // If a search term exists, filter by plan name
        if (search) {
            query.planName = { $regex: search, $options: 'i' }; 
        }

        const policies = await Policy.find(query);
        res.json(policies);
    } catch (err) {
        res.status(500).json({ message: "Error fetching data" });
    }
});

module.exports = router;

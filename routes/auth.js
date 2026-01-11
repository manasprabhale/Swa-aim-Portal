const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Policy = require('../models/Policy');
const bcrypt = require('bcryptjs');

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        res.json({ user: { id: user._id, name: user.name } });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Add Policy Route
router.post('/add-policy', async (req, res) => {
    try {
        const newPolicy = new Policy(req.body);
        await newPolicy.save();
        res.status(201).json(newPolicy);
    } catch (err) {
        res.status(500).json({ message: "Failed to save policy" });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const user = await User.create({ name, email, phone, password });
        res.status(201).json({ message: "Registration successful" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;

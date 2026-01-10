
const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   POST /api/register
 * @desc    Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user (User.js middleware handles hashing)
        user = new User({
            name,
            email,
            phone,
            password
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

/**
 * @route   POST /api/login
 * @desc    Authenticate user & return details
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Check password using the method created in User.js
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Respond with user data (excluding password)
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;

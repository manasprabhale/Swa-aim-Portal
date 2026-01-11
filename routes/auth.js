const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Policy = require('../models/Policy');

/**
 * @route   POST /api/register
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ name, email, phone, password });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

/**
 * @route   POST /api/login
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

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

/**
 * @route   GET /api/policies/:userId
 * @desc    Get policies for a specific user (Moved outside of Register)
 */
router.get('/policies/:userId', async (req, res) => {
    try {
        // Find all policies where the userId matches the one from the URL
        const policies = await Policy.find({ userId: req.params.userId });
        res.json(policies);
    } catch (err) {
        console.error('Fetch Policies Error:', err.message);
        res.status(500).json({ message: "Error fetching policies" });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Resend } = require('resend'); // Modern API for Email
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Policy = require('../models/Policy');

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// 1. USER AUTHENTICATION
// ==========================================

// Register User
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, phone, password });
        await user.save();
        res.status(201).json({ message: 'Registration successful!' });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Login User
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
        res.status(500).json({ message: 'Login failed' });
    }
});

// ==========================================
// 2. PASSWORD RESET (RESEND API)
// ==========================================

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email not found." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
        const resetLink = `${req.headers.origin}/reset-password.html?token=${token}`;

        await resend.emails.send({
            from: 'Swa-aim <onboarding@resend.dev>',
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 15 minutes.</p>`
        });

        res.json({ message: "Reset link sent to your email!" });
    } catch (err) {
        console.error("Resend Error:", err);
        res.status(500).json({ message: "Email delivery failed" });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id);
        
        if (!user) return res.status(404).json({ message: "User not found" });

        user.password = newPassword;
        await user.save();
        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired link." });
    }
});

// ==========================================
// 3. POLICY MANAGEMENT (CRUD + SEARCH)
// ==========================================

// GET: Fetch all policies for a user (Includes Search logic)
router.get('/policies/:userId', async (req, res) => {
    try {
        const { search } = req.query;
        let query = { userId: req.params.userId };

        if (search) {
            query.$or = [
                { planName: { $regex: search, $options: 'i' } },
                { policyNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const policies = await Policy.find(query).sort({ createdAt: -1 });
        res.json(policies);
    } catch (err) {
        res.status(500).json({ message: "Error fetching policies" });
    }
});

// POST: Add new policy
router.post('/add-policy', async (req, res) => {
    try {
        const newPolicy = new Policy(req.body);
        await newPolicy.save();
        res.status(201).json(newPolicy);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Policy Number must be unique" });
        }
        res.status(500).json({ message: "Error saving policy" });
    }
});

// PUT: Update policy details
router.put('/policy/:id', async (req, res) => {
    try {
        const updatedPolicy = await Policy.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.json(updatedPolicy);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

// DELETE: Remove policy
router.delete('/policy/:id', async (req, res) => {
    try {
        await Policy.findByIdAndDelete(req.params.id);
        res.json({ message: "Policy deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});

module.exports = router;

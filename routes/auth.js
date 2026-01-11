const express = require('express');
const router = express.Router();
const { Resend } = require('resend'); // Modern Email API
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Policy = require('../models/Policy');

// Initialize Resend (Ensure RESEND_API_KEY is in Render Environment Variables)
const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// 1. AUTHENTICATION (REGISTER & LOGIN)
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, phone, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed' });
    }
});

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
        res.status(500).json({ message: 'Login failed' });
    }
});

// ==========================================
// 2. PASSWORD RESET (USING RESEND API)
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
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Valid for 15 mins.</p>`
        });

        res.json({ message: "Reset link sent to your email!" });
    } catch (err) {
        res.status(500).json({ message: "Email error", error: err.message });
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
        res.json({ message: "Password updated!" });
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired link." });
    }
});

// ==========================================
// 3. POLICY MANAGEMENT (FETCH & ADD)
// ==========================================

// GET: Load all policies for the logged-in user
router.get('/policies/:userId', async (req, res) => {
    try {
        const policies = await Policy.find({ userId: req.params.userId });
        res.json(policies);
    } catch (err) {
        res.status(500).json({ message: "Error fetching policies" });
    }
});

// POST: Add new policy details
router.post('/add-policy', async (req, res) => {
    try {
        const { userId, policyNumber, planName, paymentMode, premiumAmount, sumAssured } = req.body;
        
        // Validate that all fields are present
        if (!userId || !policyNumber || !planName || !paymentMode || !premiumAmount || !sumAssured) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newPolicy = new Policy({
            userId,
            policyNumber,
            planName,
            paymentMode,
            premiumAmount,
            sumAssured
        });

        await newPolicy.save();
        res.status(201).json({ message: "Policy saved successfully!", policy: newPolicy });
    } catch (err) {
        console.error("Policy Save Error:", err);
        // Error code 11000 is for duplicate policyNumber
        if (err.code === 11000) {
            return res.status(400).json({ message: "Policy number already exists." });
        }
        res.status(500).json({ message: "Server error while saving policy." });
    }
});

// ==========================================
// 4. USER PROFILE
// ==========================================
router.put('/profile/:userId', async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findByIdAndUpdate(req.params.userId, { name, phone }, { new: true });
        res.json({ message: "Profile updated!", user });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

module.exports = router;

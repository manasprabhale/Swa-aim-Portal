const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Policy = require('../models/Policy');

const resend = new Resend(process.env.RESEND_API_KEY);

// --- AUTH ROUTES ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });
        user = new User({ name, email, phone, password });
        await user.save();
        res.status(201).json({ message: 'Registered successfully!' });
    } catch (err) { res.status(500).json({ message: 'Registration failed' }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        res.json({ user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) { res.status(500).json({ message: 'Login failed' }); }
});

// --- PASSWORD RESET ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email not found" });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
        const resetLink = `${req.headers.origin}/reset-password.html?token=${token}`;
        await resend.emails.send({
            from: 'Swa-aim <onboarding@resend.dev>',
            to: email,
            subject: 'Password Reset',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
        });
        res.json({ message: "Reset link sent!" });
    } catch (err) { res.status(500).json({ message: "Email error" }); }
});

// --- POLICY CRUD ROUTES ---

// 1. CREATE
router.post('/add-policy', async (req, res) => {
    try {
        const newPolicy = new Policy(req.body);
        await newPolicy.save();
        res.status(201).json(newPolicy);
    } catch (err) { res.status(400).json({ message: "Policy Number must be unique" }); }
});

// 2. READ
router.get('/policies/:userId', async (req, res) => {
    try {
        const policies = await Policy.find({ userId: req.params.userId });
        res.json(policies);
    } catch (err) { res.status(500).json({ message: "Fetch failed" }); }
});

// 3. UPDATE
router.put('/policy/:id', async (req, res) => {
    try {
        const updated = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: "Update failed" }); }
});

// 4. DELETE
router.delete('/policy/:id', async (req, res) => {
    try {
        await Policy.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ message: "Delete failed" }); }
});

module.exports = router;

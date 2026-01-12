const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Policy = require('../models/Policy');

// Configure Email Transporter (Cleaned up)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * @route   POST /api/register
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, phone, password });
        await user.save();
        
        // Send Welcome Email
        const mailOptions = {
            from: `"Swa-aim Portal" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Swa-aim Portal!',
            html: `
                <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #2563eb;">Welcome, ${name}!</h2>
                    <p>Thank you for joining Swa-aim Portal. Your account is now active.</p>
                    <p><strong>Your registered phone:</strong> ${phone}</p>
                    <hr>
                    <p style="font-size: 0.8rem; color: #666;">If you didn't create this account, please ignore this email.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log("Email Error:", error);
            else console.log("Email sent: " + info.response);
        });
        
        res.status(201).json({ message: 'User registered and welcome email sent!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/login
 */
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

/**
 * @route   PUT /api/profile/:userId
 */
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

/**
 * @route   GET /api/policies/:userId
 */
router.get('/policies/:userId', async (req, res) => {
    try {
        const { search } = req.query;
        let query = { userId: req.params.userId };
        if (search) {
            query.planName = { $regex: search, $options: 'i' }; 
        }
        const policies = await Policy.find(query);
        res.json(policies);
    } catch (err) {
        res.status(500).json({ message: "Error fetching data" });
    }
});

/**
 * @route   POST /api/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email not found" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
        const resetLink = `${req.headers.origin}/reset-password.html?token=${token}`;

        await transporter.sendMail({
            from: `"Swa-aim Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 15 mins.</p>`
        });

        res.json({ message: "Reset link sent to email!" });
    } catch (err) {
        res.status(500).json({ message: "Error sending reset email" });
    }
});

/**
 * @route   POST /api/reset-password
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id);
        
        if (!user) return res.status(404).json({ message: "User not found" });

        user.password = newPassword; // Middleware hashes this automatically
        await user.save();

        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
});

module.exports = router;

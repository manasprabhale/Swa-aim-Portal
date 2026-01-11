const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Policy = require('../models/Policy');

// ==========================================
// 1. CONFIGURE EMAIL TRANSPORTER
// ==========================================
// We use host/port/secure for better compatibility with cloud servers like Render
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: (process.env.EMAIL_USER || "").trim(),
        pass: (process.env.EMAIL_PASS || "").trim()
    }
});

// ==========================================
// 2. USER REGISTRATION
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, phone, password });
        await user.save();
        
        // Welcome Email
        try {
            await transporter.sendMail({
                from: `"Swa-aim Portal" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Welcome to Swa-aim!',
                html: `<h2>Welcome, ${name}!</h2><p>Your account is now active.</p>`
            });
        } catch (mailErr) {
            console.error("Welcome Email Failed:", mailErr.message);
        }
        
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed' });
    }
});

// ==========================================
// 3. USER LOGIN
// ==========================================
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
// 4. FORGOT PASSWORD (DEBUG VERSION)
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Forgot Password Request for:", email);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email not registered." });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '15m' });
        const resetLink = `${req.headers.origin}/reset-password.html?token=${token}`;

        // Send Email
        await transporter.sendMail({
            from: `"Swa-aim Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h3>Reset Your Password</h3>
                <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
                <a href="${resetLink}" style="background:#2563eb; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Reset Password</a>
            `
        });

        console.log("Reset email sent successfully to:", email);
        res.json({ message: "Reset link sent to your email!" });

    } catch (err) {
        // This log will appear in your RENDER DASHBOARD LOGS
        console.error("CRITICAL EMAIL ERROR:", err);
        res.status(500).json({ 
            message: "Error sending reset email", 
            error: err.message 
        });
    }
});

// ==========================================
// 5. RESET PASSWORD
// ==========================================
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        const user

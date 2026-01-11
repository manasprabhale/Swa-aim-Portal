const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Policy = require('../models/Policy');

// ==========================================
// 1. CONFIGURE EMAIL TRANSPORTER
// ==========================================
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
// 4. FORGOT PASSWORD
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "Email not registered." });
        }

        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '15m' }
        );
        
        const resetLink = `${req.headers.origin}/reset-password.html?token=${token}`;

        await transporter.sendMail({
            from: `"Swa-aim Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h3>Reset Your Password</h3>
                <p>Click the button below to reset your password. Link expires in 15 mins.</p>
                <a href="${resetLink}" style="background:#2563eb; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Reset Password</a>
            `
        });

        res.json({ message: "Reset link sent to your email!" });
    } catch (err) {
        console.error("CRITICAL EMAIL ERROR:", err);
        res.status(500).json({ message: "Error sending reset email", error: err.message });
    }
});

// ==========================================
// 5. RESET PASSWORD
// ==========================================
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
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
// 6. PROFILE & POLICIES (FIXED LINE 121)
// ==========================================
router.put('/profile/:userId', async (req, res) => {
    try {
        const { name, phone } = req.body;
        // FIXED: Added the initializer for the const 'user'
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
        res.status(500).json({ message: "Error fetching policies" });
    }
});

module.exports = router;

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
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Set in Render Env Variables
        pass: process.env.EMAIL_PASS  // Your 16-character App Password
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
            if (error) console.error("Welcome Email Error:", error);
            else console.log("Welcome Email sent: " + info.response);
        });
        
        res.status(201).json({ message: 'User registered and welcome email sent!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
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
        res.status(500).json({ message: 'Server error' });
    }
});

// ==========================================
// 4. FORGOT PASSWORD (SEND EMAIL)
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "Email not found. Please register first." });
        }

        // Create a secure token valid for 15 minutes
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '15m' });
        
        // Link points to your frontend reset page
        const resetLink = `${req.headers.origin}/reset-password.html?token=${token}`;

        const mailOptions = {
            from: `"Swa-aim Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h3>Reset Your Password</h3>
                <p>You requested a password reset for your Swa-aim account.</p>
                <p>Click the link below to set a new password. This link expires in 15 minutes.</p>
                <a href="${resetLink}" style="background:#2563eb; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Reset link sent to your email!" });

    } catch (err) {
        console.error("FORGOT_PW_ERROR:", err.message);
        res.status(500).json({ message: "Error sending reset email", error: err.message });
    }
});

// ==========================================
// 5. RESET PASSWORD (UPDATE DATABASE)
// ==========================================
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update password (User model middleware hashes this automatically)
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        console.error("RESET_PW_ERROR:", err.message);
        res.status(400).json({ message: "Link expired or invalid token." });
    }
});

// ==========================================
// 6. PROFILE & POLICIES
// ==========================================

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

module.exports = router;

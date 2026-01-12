const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Needed for the unique reset link
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Policy = require('../models/Policy');

// Configure Email Transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- FORGOT PASSWORD: SEND LINK ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist." });
        }

        // Create a unique token that expires in 15 minutes
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '15m' });
        
        // The link the user will click (window.location.origin is handled by frontend)
        const resetLink = `${req.headers.origin}/reset-password.html?token=${token}`;

        const mailOptions = {
            from: `"Swa-aim Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2>Password Reset</h2>
                    <p>You requested to reset your password. Click the button below to proceed:</p>
                    <a href="${resetLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    <p style="margin-top: 20px; font-size: 0.8rem; color: #666;">This link expires in 15 minutes.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Reset link sent to your email!" });

    } catch (err) {
        res.status(500).json({ message: "Error sending email." });
    }
});

// --- RESET PASSWORD: SAVE NEW PASSWORD ---
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // 1. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        // 2. Find user
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found." });

        // 3. Update password (the User.js pre-save middleware will hash this automatically)
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully! You can now login." });

    } catch (err) {
        res.status(400).json({ message: "Invalid or expired token." });
    }
});

// ... (Keep your existing Login, Register, Profile, and Policy routes below) ...
module.exports = router;

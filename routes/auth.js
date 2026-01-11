const express = require('express');
const router = express.Router();
const { Resend } = require('resend'); // Switch to Resend
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Policy = require('../models/Policy');

// Initialize Resend
// Note: Ensure RESEND_API_KEY is added to Render Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// 1. USER REGISTRATION
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, phone, password });
        await user.save();
        
        // Optional: Send Welcome Email via Resend
        try {
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'Welcome to Swa-aim!',
                html: `<strong>Welcome ${name}!</strong><p>Account created successfully.</p>`
            });
        } catch (mailErr) {
            console.log("Welcome email skipped: ", mailErr.message);
        }

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed' });
    }
});

// ==========================================
// 2. USER LOGIN
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
// 3. FORGOT PASSWORD (BYPASSES SMTP BLOCK)
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
            process.env.JWT_SECRET || 'secret_key', 
            { expiresIn: '15m' }
        );
        
        const resetLink = `${req.headers.origin}/reset-password.html?token=${token}`;

        // Using Resend API instead of SMTP
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Swa-aim Password Reset',
            html: `
                <h3>Reset Your Password</h3>
                <p>Click the link below to reset your password. It expires in 15 minutes.</p>
                <a href="${resetLink}" style="padding:10px; background-color:#2563eb; color:white; text-decoration:none; border-radius:5px;">Reset Password</a>
            `
        });

        if (error) {
            console.error("Resend API Error:", error);
            return res.status(500).json({ message: "Email service error", error });
        }

        res.json({ message: "Reset link sent to your email!" });

    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.status(500).json({ message: "Error processing request" });
    }
});

// ==========================================
// 4. RESET PASSWORD
// ==========================================
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
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
// 5. PROFILE & POLICIES
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

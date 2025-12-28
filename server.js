const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'insurance_secret_key';

// Updated Schema with Policies Array
const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    policies: [{ 
        policyNumber: String,
        policyType: { type: String, default: 'Basic Life Coverage' },
        premium: Number,
        status: { type: String, default: 'Active' }
    }]
});
const Customer = mongoose.model('Customer', customerSchema);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
    })
    .catch(err => console.error('❌ DB Error:', err));

// Registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newCustomer = new Customer({ name, email, password: hashedPassword, phone, policies: [] });
        await newCustomer.save();
        res.status(201).json({ message: 'Account created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Login - Returns full policies array
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Customer.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, user: { name: user.name, email: user.email, policies: user.policies } });
    } catch (error) {
        res.status(500).json({ message: 'Login error' });
    }
});

// NEW: Add Multiple Policies Route
app.post('/api/add-policy', async (req, res) => {
    try {
        const { email, policyNumber, policyType, premium } = req.body;
        const user = await Customer.findOne({ email });
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.policies.push({ policyNumber, policyType, premium });
        await user.save();
        
        res.json({ message: 'Policy added successfully!', policies: user.policies });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add policy' });
    }
});

// Forgot Password Route
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email, phone, newPassword } = req.body;
        const user = await Customer.findOne({ email, phone });
        if (!user) return res.status(404).json({ message: 'Verification failed' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Reset failed' });
    }

});

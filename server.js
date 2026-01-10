const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // Allows Netlify to talk to Render

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    }
const JWT_SECRET = process.env.JWT_SECRET;

// Schema
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

// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
    })
    .catch(err => console.error('❌ DB Error:', err));

// Registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Customer({ name, email, phone, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        res.status(400).json({ message: 'Registration failed' });
    }
});

// Login
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

// Add Policy (Protected)
app.post('/api/add-policy', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { policyNumber, policyType, premium } = req.body;
        const user = await Customer.findById(decoded.id);
        user.policies.push({ policyNumber, policyType, premium });
        await user.save();
        res.json({ message: 'Policy added', policies: user.policies });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add policy' });
    }
});


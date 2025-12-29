require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. MIDDLEWARE
app.use(express.json()); // Allows server to read JSON data from your forms
app.use(cors());         // Allows your frontend to talk to your backend

// 2. SERVE FRONTEND FILES
// This automatically hosts anything inside the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.log("❌ DB Connection Error:", err.message));

// 4. API ROUTES

// --- Registration Route ---
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();
        
        res.status(201).json({ message: "Investor registered successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- Login Route ---
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // Simple password check (Note: Hashing should be added later for security)
        if (!user || user.password !== password) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        res.status(200).json({ 
            message: "Login successful!", 
            user: { 
                name: user.name, 
                email: user.email, 
                role: user.role,
                totalInvestment: user.totalInvestment 
            } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. HOMEPAGE ROUTE
// This ensures that visiting your URL loads your index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 6. START THE SERVER
app.listen(PORT, () => {
    console.log(`🚀 Swa-aim Portal is live on port ${PORT}`);
});

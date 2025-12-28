require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. IMPORT THE USER MODEL
// This looks into your 'models' folder for the User.js file you just made.
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// 2. MIDDLEWARE
app.use(express.json()); // Essential for reading JSON data from your website
app.use(cors());

// 3. DATABASE CONNECTION
// This uses the MONGO_URI you saved in your Render Environment settings.
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Database Connected & User Model Loaded"))
    .catch(err => console.log("❌ DB Error:", err.message));

// 4. THE REGISTER ROUTE
// This is the "endpoint" where your frontend will send user data.
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Create new user using our User Model
        const newUser = new User({ name, email, password });
        
        // Save to MongoDB
        await newUser.save();
        
        res.status(201).json({ message: "Investor registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Home route for testing
app.get('/', (req, res) => {
    res.send('Swa-aim Portal Backend is Active and Database is Linked!');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Points to your models folder

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Basic check to see if it works
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });
        
        // Add your bcrypt password comparison here...
        
        res.status(200).json({ message: "Login success", user: { name: user.name } });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;

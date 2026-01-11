const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Middlewares
app.use(express.json()); // Essential for reading JSON from frontend
app.use(cors());

// 2. Serve Static Frontend Files
// This ensures that index.html and reset-password.html are visible
app.use(express.static(path.join(__dirname, 'public')));

// 3. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to Swa-aim MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 4. Import Routes
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes); // All routes in auth.js will start with /api

// 5. Handle Reset Password Routing
// Since we have a separate file for reset, this helps the browser find it
app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

// 6. Start the Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Swa-aim Server running on port ${PORT}`);
});

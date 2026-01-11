const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Database Connection
// Added a check to make sure MONGO_URI exists in your .env file
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is not defined in your .env file!");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 3. API Routes
// IMPORTANT: Ensure the file actually exists at ./routes/auth.js
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// 4. Serve Static Frontend Files
// Ensure your index.html, script.js, and style.css are inside a folder named 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 5. Catch-all Route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 6. Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => { 
    // Adding '0.0.0.0' helps Render bind to the correct network interface
    console.log(`🚀 Server running on port ${PORT}`);
});

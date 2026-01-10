const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Serve static files from the 'public' folder
// This makes index.html, style.css, and script.js accessible
app.use(express.static(path.join(__dirname, 'public')));

// 2. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 3. API Routes 
// Ensure your folder is named 'routes' and file is 'auth.js'
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// 4. Catch-all route 
// Solves the "Cannot GET /" and Netlify 404 issues
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Serve Static Frontend Files
// This tells Express to serve index.html, style.css, etc., from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// 3. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 4. API Routes
// Links the auth logic (login/register) from your routes folder
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// 5. Catch-all Route
// This is the most important fix for Render. It ensures that if a user 
// refreshes the page or visits a link, they get your index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 6. Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at: https://swaim-portal.onrender.com`);
});

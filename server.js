const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const app = express();

app.use(express.json());
app.use(cors());

// Link the 'public' folder for the frontend
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);

// Landing page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to Database'))
    .catch((err) => console.error('❌ Connection Error:', err));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server live on port ${PORT}`));

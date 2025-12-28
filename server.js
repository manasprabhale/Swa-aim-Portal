require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Use Render's dynamic port or default to 5000 for local testing
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(express.json());
app.use(cors());

// 2. Database Connection
// Ensure 'MONGO_URI' is the name used in your Render Environment settings
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
    .then(() => {
        console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err.message);
    });

// 3. Routes

// Home Route
app.get('/', (req, res) => {
    res.send('Swa-aim Portal Backend is Running...');
});

// Database Status Check Route
// Visit https://swaim-portal.onrender.com/db-check to see this
app.get('/db-check', (req, res) => {
    const states = {
        0: "Disconnected",
        1: "Connected",
        2: "Connecting",
        3: "Disconnecting"
    };
    const stateNum = mongoose.connection.readyState;
    res.json({
        status: states[stateNum],
        dbName: mongoose.connection.name
    });
});

// 4. Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

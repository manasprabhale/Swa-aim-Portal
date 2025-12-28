require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(express.json());
app.use(cors());

// 2. Database Connection
// This "process.env.MONGO_URI" pulls the link from your Render settings
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
    .then(() => {
        console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:");
        console.error(err.message);
    });

// 3. Simple Test Route
app.get('/', (req, res) => {
    res.send('Swa-aim Portal Backend is Running...');
});

// 4. Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

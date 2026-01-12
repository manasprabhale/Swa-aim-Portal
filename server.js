const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE CONNECTION ---
// Using MONGODB_URI to match your Render environment settings
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- API ROUTES ---

// Get all policies
app.get('/api/policies', async (req, res) => {
    try {
        const policies = await mongoose.connection.collection('policies').find({}).toArray();
        res.json(policies);
    } catch (err) {
        res.status(500).send("Error fetching policies");
    }
});

// Add a new policy
app.post('/api/policies', async (req, res) => {
    try {
        const { name, holder } = req.body;
        await mongoose.connection.collection('policies').insertOne({ name, holder, date: new Date() });
        res.status(201).send("Policy Saved");
    } catch (err) {
        res.status(500).send("Error saving policy");
    }
});

// Delete a policy
app.delete('/api/policies/:id', async (req, res) => {
    try {
        await mongoose.connection.collection('policies').deleteOne({ 
            _id: new mongoose.Types.ObjectId(req.params.id) 
        });
        res.status(200).send("Policy Deleted");
    } catch (err) {
        res.status(500).send("Error deleting policy");
    }
});

// --- FRONTEND ROUTES ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Professional Server running on port ${PORT}`);
});

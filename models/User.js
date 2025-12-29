const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalInvestment: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

// This schema defines the structure of an investor/user in your database
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // This prevents multiple accounts with the same email
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    totalInvestment: {
        type: Number,
        default: 0 // New users start with 0 investment
    },
    role: {
        type: String,
        enum: ['investor', 'admin'],
        default: 'investor'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Export the model so it can be used in server.js
module.exports = mongoose.model('User', UserSchema);

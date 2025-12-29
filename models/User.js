const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    // Array to allow multiple policies per customer
    policies: [{
        policyNumber: String,
        dob: String,
        premium: Number,
        mode: String, // Monthly, Quarterly, Yearly
        dateAdded: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

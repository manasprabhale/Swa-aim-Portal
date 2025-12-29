const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    // This array allows one user to have multiple policies
    policies: [{
        policyNumber: { type: String, required: true },
        dob: { type: String, required: true },
        premium: { type: Number, required: true },
        paymentMode: { type: String, required: true }, // e.g., Monthly, Yearly
        status: { type: String, default: 'Active' },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

// models/User.js
const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    policyNumber: { type: String, required: true },
    dob: { type: Date, required: true },
    premium: { type: Number, required: true },
    mode: { type: String, required: true, enum: ['Monthly', 'Quarterly', 'Yearly'] }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    policies: [policySchema]  // Array of policies embedded in user
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
    password: { type: String, required: true },
    policies: [{
        policyNumber: String,
        dob: String,
        premium: Number,
        mode: String // Monthly, Quarterly, Yearly
    }]
});

module.exports = mongoose.model('User', UserSchema);

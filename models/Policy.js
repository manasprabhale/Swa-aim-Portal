const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planName: { type: String, required: true },
    policyNumber: { type: String, required: true },
    frequency: { type: String, enum: ['Yearly', 'Monthly'], default: 'Yearly' },
    premiumAmount: { type: Number, required: true },
    sumAssured: { type: Number, required: true },
    status: { type: String, default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Policy', PolicySchema);

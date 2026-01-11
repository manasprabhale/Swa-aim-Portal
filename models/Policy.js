const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    policyNumber: { type: String, required: true, unique: true },
    planName: { type: String, required: true },
    paymentMode: { type: String, enum: ['Monthly', 'Quarterly', 'Yearly'], required: true },
    premiumAmount: { type: Number, required: true },
    sumAssured: { type: Number, required: true },
    status: { type: String, default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Policy', PolicySchema);

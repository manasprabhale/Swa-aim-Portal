const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planName: { type: String, required: true },
    status: { type: String, default: 'Active' },
    amount: { type: Number, required: true },
    description: { type: String }
});

module.exports = mongoose.model('Policy', PolicySchema);

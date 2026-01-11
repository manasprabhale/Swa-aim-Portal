const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
    // Links the policy to a specific user ID
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    planName: { 
        type: String, 
        required: [true, 'Plan name is required'] 
    },
    status: { 
        type: String, 
        default: 'Active' 
    },
    amount: { 
        type: Number, 
        required: [true, 'Investment amount is required'] 
    },
    description: { 
        type: String 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Policy', PolicySchema);

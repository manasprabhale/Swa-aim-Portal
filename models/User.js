const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Needed to encrypt passwords

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        lowercase: true, // Stores 'Email@Me.com' as 'email@me.com'
        trim: true 
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: 6 // Basic security check
    },
    phone: { 
        type: String, 
        trim: true 
    }
}, { 
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
});

// Middleware: Hash the password before saving it to the database
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with the hashed password in DB
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

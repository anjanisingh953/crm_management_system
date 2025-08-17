const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    dob: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String },
    userType: { type: String }
});

UserSchema.index({ firstName: 1, dob: 1 }, { unique: true }); // Composite index for uniqueness

module.exports = mongoose.model('User', UserSchema);

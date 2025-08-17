const mongoose = require('mongoose');

const UserAccountSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('UserAccount', UserAccountSchema);
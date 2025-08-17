const mongoose = require('mongoose');

const LobSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Lob', LobSchema);
const mongoose = require('mongoose');

const CarrierSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Carrier', CarrierSchema);
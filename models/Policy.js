const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
    policyNumber: { type: String, required: true, unique: true },
    policyStartDate: { type: Date, required: true },
    policyEndDate: { type: Date, required: true },
    premiumAmount: { type: Number },
    // Relationships using ObjectIds
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    carrierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier' },
    lobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lob' }
});

module.exports = mongoose.model('Policy', PolicySchema);
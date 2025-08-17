const mongoose = require('mongoose');

const ScheduledMessageSchema = new mongoose.Schema({
    message: { type: String, required: true },
    scheduledTime: { type: Date, required: true },
    insertedAt: { type: Date }
});

module.exports =mongoose.model('ScheduledMessage', ScheduledMessageSchema);

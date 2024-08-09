const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CancelMembershipSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    anyMessage: {
        type: String,
    },
}, { timestamps: true });

const CancelMembership = mongoose.model('CancelMembership', CancelMembershipSchema);
module.exports = CancelMembership;

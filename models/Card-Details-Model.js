const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardDetailsSchema = new Schema({
    cardNumber: {
        type: String,
        required: true,
    },
    nameOfCard: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: String,
        required: true,
    },
    cvv: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plan: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const CardDetails = mongoose.model('CardDetails', CardDetailsSchema);

module.exports = CardDetails;

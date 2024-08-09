const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BannerSchema = new Schema({

    bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },

    status: {
        type: Boolean,
        default: true

    }


}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);

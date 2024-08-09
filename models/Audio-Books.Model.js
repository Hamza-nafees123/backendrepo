const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    bookTitle: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    primaryCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Audio',
        required: true
    },
    secondaryCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Audio',
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    longDescription: {
        type: String,
        required: true
    },
    imageUpload: {
        url: String,
        public_id: String,
    },
    uploadAudio: {
        url: String,
        public_id: String,
    },
    rating: {
        type: Number,
        default: 0, // Default rating value, if not provided
    },
    // bookListen: {
    //     type: Number,
    //     default: 0 // Default listen count, if not provided
    // },
    // bookDownload: {
    //     type: Number,
    //     default: null
    // }

}, { timestamps: true });

module.exports = mongoose.model('Audio-Book', bookSchema);

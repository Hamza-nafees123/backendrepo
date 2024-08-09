const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const favouriteSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    bookTitle: {
        type: String,
        required: true
    },
    oblicAuthor: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },

    primaryCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    secondaryCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    series: {
        type: Boolean
    },
    shortDescription: {
        type: String,
        required: true
    },
    longDescription: {
        type: String,
        required: true
    },
    bookCoverImage: {
        type: String,
        required: true

    },
    pdfUpdate: {
        type: String,
        required: true
    },
    epubUpload: {
        type: String,
        // required: true
    },
    kindleMobiUpload: {
        type: String,
        // required: true
    },
    status: {
        type: Boolean,
        default: false

    },
    rating: {
        type: Number,
        default: 0, // Default rating value, if not provided
    },
    isFavourite: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

// Create a model based on the schema
const Favourite = mongoose.model('favourite', favouriteSchema);

module.exports = Favourite;

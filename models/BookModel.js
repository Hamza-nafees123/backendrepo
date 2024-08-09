const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
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
        url: { type: String },
        publicId: { type: String }
    },
    pdfUpdate: {
        url: { type: String },
        publicId: { type: String }
    },
    epubUpload: {
        url: { type: String },
        publicId: { type: String }
    },
    kindleMobiUpload: {
        url: { type: String },
        publicId: { type: String }
    },
    // compressedFile: {
    //     url: String,
    //     publicId: String
    // },
    isFavourite: {
        type: Boolean,
        default: false
    },
    rating: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now },

});

// Middleware to remove related recently read books
bookSchema.pre('remove', async function (next) {
    try {
        await RecentlyReadBookSchema.deleteMany({ bookId: this._id });
        next();
    } catch (err) {
        next(err);
    }
});


module.exports = mongoose.model('Book', bookSchema);

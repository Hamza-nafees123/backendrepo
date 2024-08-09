const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recomendedSchema = new Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
}, { timestamps: true });

module.exports = mongoose.model('recommended-books', recomendedSchema);

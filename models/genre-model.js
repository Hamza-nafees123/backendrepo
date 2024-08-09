const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    name: String,
    topPicks: [String]
}, { timestamps: true });

module.exports = mongoose.model('Genre', genreSchema);

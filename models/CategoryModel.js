const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    clickCount: { type: Number, default: 0 }, // New field for click count
});

module.exports = mongoose.model('Category', categorySchema);

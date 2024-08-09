const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const faqSchema = new Schema({
    name: {
        type: String,
        required: true
    },
}, { timestamps: true });

// Create a model based on the schema
const Faqs = mongoose.model('FaqCategory', faqSchema);

module.exports = Faqs;
